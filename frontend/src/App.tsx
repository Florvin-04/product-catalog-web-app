import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      {/* <div className="bg-red-500">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-bold underline">Vite + React</h1>
      <div className="card">
        <Button className="bg-red-500" onClick={() => getProducts()}>
          View all Products
        </Button>
        <Button className="bg-red-500" onClick={() => addCategory("phones")}>
          add category
        </Button>

        <Button
          className="bg-red-500"
          onClick={() =>
            addProduct({ name: "oppo122", categoryIds: [4, 5], price: 1000 })
          }
        >
          add product
        </Button>
        <Button className="bg-red-500" onClick={() => deleteProduct(7)}>
          Delete Product
        </Button>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}

      <Dashboard />
    </>
  );
}

export default App;
