import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore, type User } from '../../stores/useAuthStore';


export default function LogIn() {
  const {setIsAuthenticated, setUser} = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_me: false
  });

  function handleChange(e : React.ChangeEvent<HTMLInputElement>) {
      const { name, value, checked, type } = e.target;
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value, }));
  };

  async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
      e.preventDefault();


      if (!formData.email || !formData.password) {
      alert("Please fill out both fields");
      return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log(apiUrl);
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, password: formData.password, remember_me: formData.remember_me || false }),
      });

      if (res.ok) {
        console.log("Login successful");
        const user : User = await res.json();
        setIsAuthenticated(true)
        setUser(user);
        navigate('/');
      } else {
        const errorData = await res.json();
        alert(`Login failed: ${errorData.message || 'Unknown error'}`);
      }
  };

  return (
    <div className="w-full h-[90vh] p-10 flex items-center justify-center bg-[#171513] text-white">
      <div className="w-1/3 h-5/6 bg-[#262322] p-10 rounded-md">
         <form className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)} >
          <h2 className="text-3xl text-center font-bold">Log in</h2>

          <label>
            <p className="mb-2">Email</p>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required

              className="outline-2 outline-[#454340] rounded-sm focus:ring-0 focus:outline-2 focus:outline-white p-3 w-full"
            />
          </label>
          

          <label>
            <p className="mb-2">Password</p>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="outline-2 outline-[#454340] rounded-sm focus:ring-0 focus:outline-2 focus:outline-white p-3 w-full mb-2"
            />
            <a href="/forgot-password" className="text-blue-300 underline">Forgot Password?</a>
          </label>


          <label>
            <span className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                name="remember_me"
                className="scale-125"
                onChange={handleChange}
              />
              <p>Remember Me</p>
            </span>
          
            
          </label>

          <button type="submit" style={{ padding: '10px 20px' }} className="bg-[#363430] text-white rounded-sm hover:bg-[#454340] transition-colors duration-300">
            Log In
          </button>

          <p className="text-blue-300 self-center">Don't have an account? <a href="/auth/signup" className="underline">Sign up</a></p>
        </form>
      </div>
    </div>
   
  );
}