const API_BASE = `http://${window.location.hostname}:8787`;

export const apiRequest = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || response.statusText;
        } catch {
            errorMessage = response.statusText;
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }
    if (response.status === 204) return null;
    return response.json();
};
