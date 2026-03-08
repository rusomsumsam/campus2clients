import { Outlet} from "react-router-dom";
import Navbar from "./pages/navbar/Navbar";

function App() {

  return (
    <div>

      <Navbar></Navbar>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;