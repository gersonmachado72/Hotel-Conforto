// API Service
const API_BASE = '/api';

class HotelAPI {
    // Quartos
    static async getQuartos() {
        const response = await fetch(`${API_BASE}/quartos`);
        return response.json();
    }
    
    static async getQuarto(id) {
        const response = await fetch(`${API_BASE}/quartos/${id}`);
        return response.json();
    }
    
    // Reservas
    static async createReserva(reservaData) {
        const response = await fetch(`${API_BASE}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservaData)
        });
        return response.json();
    }
    
    static async getMinhasReservas() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const response = await fetch(`${API_BASE}/reservas/minhas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/painel/login.html';
            return null;
        }
        
        return response.json();
    }
    
    // Hóspedes
    static async criarHospede(hospedeData) {
        const response = await fetch(`${API_BASE}/hospedes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hospedeData)
        });
        return response.json();
    }
    
    // Autenticação
    static async login(email, senha) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });
        
        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }
        
        return response.json();
    }
    
    static async verificarAutenticacao() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const response = await fetch(`${API_BASE}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                return response.json();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return null;
            }
        } catch (error) {
            return null;
        }
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Utilitários
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Exportar para uso global
window.HotelAPI = HotelAPI;
window.formatarData = formatarData;
window.formatarMoeda = formatarMoeda;
