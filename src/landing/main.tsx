import { useState } from 'react';

const AuthSelector = () => {
    // Estado para controlar si las opciones de registro están visibles
    const [showRegisterOptions, setShowRegisterOptions] = useState(false);

    // Función para manejar el clic en "Iniciar Sesión"
    const handleLoginClick = () => {
        alert('Redirigiendo a la página de inicio de sesión...');
        // Aquí podrías usar React Router para la navegación, por ejemplo:
        // navigate('/login');
    };

    // Función para manejar el clic en "Registrarse como Cliente"
    const handleClientRegisterClick = () => {
        alert('Redirigiendo al formulario de registro de Cliente...');
        // navigate('/register/client');
    };

    // Función para manejar el clic en "Registrarse como Contador"
    const handleAccountantRegisterClick = () => {
        alert('Redirigiendo al formulario de registro de Contador...');
        // navigate('/register/accountant');
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '400px' }}>
                <div className="card-body text-center">
                    <h1 className="card-title">Bienvenido</h1>
                    <p className="card-text">Selecciona una opción para continuar.</p>
                    
                    <div className="d-grid gap-2 mt-4">
                        <button 
                            className="btn btn-primary"
                            onClick={handleLoginClick}
                        >
                            <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
                        </button>
                        <button 
                            className="btn btn-success"
                            onClick={() => setShowRegisterOptions(true)}
                        >
                            <i className="bi bi-person-plus-fill me-2"></i> Registrarse
                        </button>
                    </div>

                    {/* Muestra estas opciones solo si showRegisterOptions es verdadero */}
                    {showRegisterOptions && (
                        <div className="mt-4 animate__animated animate__fadeIn">
                            <h5 className="mb-3">¿Cómo deseas registrarte?</h5>
                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={handleClientRegisterClick}
                                >
                                    Registrarse como Cliente
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={handleAccountantRegisterClick}
                                >
                                    Registrarse como Contador
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthSelector;