import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  function handleChange(e : React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
      e.preventDefault();


      if (!formData.email || !formData.password) {
      alert("Please fill out both fields");
      return;
      }

      console.log("User registered:", formData);

      const res = await fetch(`${import.meta.env.API_URL}/signup`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      if (res.ok) {
        navigate('/');
      }
      
      setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="w-full h-[90vh] p-10 flex items-center justify-center bg-[#171513] text-white">
      <div className="w-1/3 h-5/6 bg-[#262322] p-10 rounded-md">
         <form className="flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)} >
          <h2 className="text-3xl text-center font-bold">Sign up</h2>

          <label>
            <p className="mb-2">Name</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="outline-2 outline-[#454340] rounded-sm focus:ring-0 focus:outline-2 focus:outline-white p-3 w-full"
            />

          </label>

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
          </label>

          <button type="submit" style={{ padding: '10px 20px' }} className="bg-[#363430] text-white rounded-sm hover:bg-[#454340] transition-colors duration-300">
            Sign Up
          </button>

          <p className="text-blue-300 self-center">Already have an account? <a href="/auth/login" className="underline">Log in</a></p>
        </form>
      </div>






    </div>
   
  );
}