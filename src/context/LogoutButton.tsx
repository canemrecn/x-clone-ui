//src/context/LogoutButton.tsx
import { useAuth } from "@/context/AuthContext";

const LogoutButton = () => {
    const auth = useAuth();

    if (!auth) {
        console.error("❌ AuthContext bulunamadı!");
        return null;
    }

    return (
        <button onClick={auth.logout}>Çıkış Yap</button>
    );
};

export default LogoutButton;
