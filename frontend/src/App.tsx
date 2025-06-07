import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="h-screen w-full">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-center">
          <h1 className="text-[4rem] font-bold">Admin Dashboard</h1>
        </div>
        <div className=" flex-1 ">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
