import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import CreateAcc from './pages/CreateAcc/CreateAcc';
import RTCPractice from './pages/RTCPractice/RTCPractice';
import Rooms from './pages/Rooms/Rooms';
import Chat from './pages/Chat/Chat';
import Calendar from './pages/Calendar/Calendar';
import Tasks from './pages/Tasks/Tasks';
import Budget from './pages/Budget/Budget';
import Safety from './pages/Safety/Safety';
import './styles/App.css';

function App() {
  return (
    <div className='lego_yellow'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<CreateAcc />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rtc-practice/:roomId?" element={<RTCPractice />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/safety" element={<Safety />} />
      </Routes>
    </div>
  )
}

export default App
