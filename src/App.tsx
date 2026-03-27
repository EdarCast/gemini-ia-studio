import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Idea, suggestImprovements, detectSimilarities } from './services/geminiService';

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Simulated User State
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedIdeas = localStorage.getItem('brainstorm_ideas');
    if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
    
    const savedUser = localStorage.getItem('simulated_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('brainstorm_ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('simulated_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('simulated_user');
    }
  }, [user]);

  const handleSimulatedLogin = () => {
    const mockUser = {
      name: 'Usuario Demo',
      email: 'demo@example.com',
      photo: 'https://picsum.photos/seed/user/100/100'
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const categories = useMemo(() => {
    const cats = new Set(ideas.map(i => i.category));
    return ['Todas', ...Array.from(cats)];
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Todas' || idea.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [ideas, searchTerm, filterCategory]);

  const counters = useMemo(() => {
    const total = ideas.length;
    const byCategory = ideas.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = {
      Nueva: ideas.filter(i => i.status === 'Nueva').length,
      'En progreso': ideas.filter(i => i.status === 'En progreso').length,
      Completada: ideas.filter(i => i.status === 'Completada').length,
    };

    return { total, byCategory, byStatus };
  }, [ideas]);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    let improvements = formData.improvements || '';
    if (!editingIdea || (editingIdea && (editingIdea.title !== formData.title || editingIdea.description !== formData.description))) {
      improvements = await suggestImprovements(formData);
    }

    if (editingIdea) {
      setIdeas(prev => prev.map(i => i.id === editingIdea.id ? { ...i, ...formData, improvements } as Idea : i));
    } else {
      const newId = ideas.length > 0 ? Math.max(...ideas.map(i => i.id)) + 1 : 1;
      const newIdea: Idea = {
        ...formData as Idea,
        id: newId,
        improvements
      };
      
      // Similarity check (optional notification)
      const similarIds = await detectSimilarities(newIdea, ideas);
      if (similarIds.length > 0) {
        console.log("Ideas similares detectadas:", similarIds);
        // In a real app, we'd show a UI prompt here
      }

      setIdeas(prev => [...prev, newIdea]);
    }

    resetForm();
    setIsAnalyzing(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      importance: 'Media',
      status: 'Nueva',
      category: 'General',
      notes: '',
      improvements: ''
    });
    setEditingIdea(null);
    setIsFormOpen(false);
  };

  const startEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setFormData(idea);
    setIsFormOpen(true);
  };

  const deleteIdea = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
      setIdeas(prev => prev.filter(i => i.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setIdeas(prev => prev.map(i => {
      if (i.id === id) {
        const nextStatus = i.status === 'Completada' ? 'Nueva' : 'Completada';
        return { ...i, status: nextStatus as any };
      }
      return i;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Lightbulb size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Brainstorming Manager</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar ideas..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-gray-900">{user.name}</p>
                    <button onClick={handleLogout} className="text-[10px] text-red-500 hover:underline font-medium">Cerrar sesión</button>
                  </div>
                  <img 
                    src={user.photo} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-full border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <button 
                  onClick={handleSimulatedLogin}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar con Google</span>
                </button>
              )}

              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nueva Idea</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Ideas</p>
            <p className="text-2xl font-bold text-gray-900">{counters.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nuevas</p>
            <p className="text-2xl font-bold text-blue-600">{counters.byStatus.Nueva}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">En Progreso</p>
            <p className="text-2xl font-bold text-purple-600">{counters.byStatus['En progreso']}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completadas</p>
            <p className="text-2xl font-bold text-green-600">{counters.byStatus.Completada}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={16} className="text-gray-400 mr-2 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterCategory === cat 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat} {cat !== 'Todas' && `(${counters.byCategory[cat] || 0})`}
            </button>
          ))}
        </div>

        {/* Idea List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredIdeas.map((idea) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`idea-card flex flex-col h-full ${idea.status === 'Completada' ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-gray-400">Idea #{idea.id}</span>
                  <div className="flex gap-2">
                    <span className={`badge badge-${idea.importance.toLowerCase()}`}>
                      {idea.importance}
                    </span>
                    <span className={`badge badge-${idea.status === 'En progreso' ? 'progreso' : idea.status.toLowerCase()}`}>
                      {idea.status}
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${idea.status === 'Completada' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {idea.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                  {idea.description}
                </p>

                <div className="space-y-3 mb-6">
                  {idea.category && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Zap size={14} className="text-blue-500" />
                      <span className="font-medium">{idea.category}</span>
                    </div>
                  )}
                  {idea.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                        <MessageSquare size={12} />
                        Notas
                      </div>
                      <p className="text-xs text-gray-600 italic">{idea.notes}</p>
                    </div>
                  )}
                  {idea.improvements && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1">
                        <Lightbulb size={12} />
                        Sugerencias IA
                      </div>
                      <p className="text-xs text-blue-700 leading-relaxed">{idea.improvements}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <button 
                    onClick={() => toggleStatus(idea.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      idea.status === 'Completada' 
                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={idea.status === 'Completada' ? "Marcar como pendiente" : "Marcar como completada"}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => startEdit(idea)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteIdea(idea.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredIdeas.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No se encontraron ideas</h3>
              <p className="text-gray-500">Prueba con otros términos o crea una nueva idea.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingIdea ? `Editar Idea #${editingIdea.id}` : 'Nueva Idea Brillante'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddOrEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej: App de intercambio de libros"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Describe tu idea en detalle..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Importancia</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                      value={formData.importance}
                      onChange={e => setFormData({...formData, importance: e.target.value as any})}
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="Nueva">Nueva</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Tecnología, Salud, Hobby..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Notas Adicionales</label>
                  <textarea 
                    rows={2}
                    placeholder="Cualquier pensamiento extra..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isAnalyzing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {editingIdea ? 'Guardar Cambios' : 'Crear Idea'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Summary Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex justify-around items-center">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
            <p className="text-sm font-bold">{counters.total}</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-blue-400 uppercase">Nuevas</p>
            <p className="text-sm font-bold">{counters.byStatus.Nueva}</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-green-400 uppercase">Hechas</p>
            <p className="text-sm font-bold">{counters.byStatus.Completada}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
