import { createContext, useState } from "react";

const AuthContext = createContext({
    auth: {
        email: '',
        role: '',
        accessToken: ''
    },
    setAuth: () => {} 
});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        email: '',
        role: '',
        accessToken: ''
    });

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
