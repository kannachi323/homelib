
export function AuthButtons() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">Welcome to HomeLib!</h1>
      <h2>Get Started</h2>

      <div className="flex flex-row justify-center gap-5 w-1/2 h-[64px] p-2">
        <button className="p-2 border-2 rounded-full w-1/4">Log in</button>
        <button className="p-2 border-2 rounded-full w-1/4">Sign up</button>
      </div>
    </div>
  );
}