export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const COLORS = {
  primary: '#5b72f2',
  accent: '#1D9E75',
  danger: '#E24B4A',
  warning: '#EF9F27',
  saffron: '#FF9933',
  xp: '#FFD700',
}

export const TOPICS = {
  preamble: { label: 'Preamble', icon: '🇮🇳', color: '#7F77DD' },
  fundamentalRights: { label: 'Fundamental Rights', icon: '⚖️', color: '#1D9E75' },
  fundamentalDuties: { label: 'Fundamental Duties', icon: '🤝', color: '#D85A30' },
  parliament: { label: 'Parliament', icon: '🏛️', color: '#378ADD' },
  judiciary: { label: 'Judiciary', icon: '👨‍⚖️', color: '#BA7517' },
  emergency: { label: 'Emergency', icon: '🚨', color: '#E24B4A' },
  amendments: { label: 'Amendments', icon: '📝', color: '#1D9E75' },
  mixed: { label: 'Mixed', icon: '🎲', color: '#9090A8' },
  directivePrinciples: { label: 'Directive Principles', icon: '📜', color: '#639922' },
}

export const LEVELS = [
  { min: 1, max: 2, title: 'Citizen', icon: '🧑' },
  { min: 3, max: 4, title: 'Law Student', icon: '📚' },
  { min: 5, max: 6, title: 'Advocate', icon: '👔' },
  { min: 7, max: 9, title: 'Barrister', icon: '⚖️' },
  { min: 10, max: 14, title: 'Judge', icon: '👨‍⚖️' },
  { min: 15, max: 19, title: 'Senior Advocate', icon: '🏛️' },
  { min: 20, max: 999, title: 'Constitutional Expert', icon: '🌟' },
]

export const getLevelInfo = (level) => {
  return LEVELS.find((l) => level >= l.min && level <= l.max) || LEVELS[0]
}

export const XP_PER_LEVEL = 500
