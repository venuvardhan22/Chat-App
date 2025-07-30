import './App.css'
import Login from './Pages/Login'
import Home from './Pages/Home'
import {BrowserRouter as Router,Route,Routes,Navigate} from "react-router-dom"
import Messages from './Pages/Messages'
import Signin from './Pages/Signin'
import { ProtectLogin, ProtectHome, ProtectSignin } from './lib/ProtectionRoute'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectLogin><Login/></ProtectLogin>}></Route>
          <Route path="/signin" element={<ProtectSignin><Signin/></ProtectSignin>}></Route>
          <Route path="/home" element={<ProtectHome><Home/></ProtectHome>}></Route>
          <Route path='/messages/:id' element={<ProtectHome><Messages/></ProtectHome>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
