import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "./Auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isRegistering) {
        await register(email, password);
        console.log("ユーザー登録成功");
      } else {
        await login(email, password);
        console.log("ログイン成功");
      }
      navigate("/"); // ここでリダイレクト
    } catch (error) {
      console.error("操作に失敗しました", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegistering ? "登録" : "ログイン"}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "既にアカウントをお持ちですか？ログイン" : "新規登録"}
      </button>
    </div>
  );
};

export default LoginPage;