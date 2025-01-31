import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { auth, db } from "./firebaseConfig";
import { addClass, getClasses, addTask, getTasks } from "./DataService";
import { onAuthStateChanged } from "firebase/auth";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", date: "", className: "" });
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: "", priority: 1 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadUserData(user.uid);
      } else {
        setUser(null);
        setClasses([]);
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    const userClasses = await getClasses(userId);
    setClasses(userClasses);
    const userTasks = await getTasks(userId);
    const formattedTasks = userTasks.map(task => ({
      ...task,
      start: task.start.toDate(),
      end: task.end.toDate()
    }));
    setEvents(formattedTasks);
  };

  useEffect(() => {
    if (classes.length > 0) {
      updateTaskPriorities(classes);
    }
  }, [classes]);

  const handleClassSubmit = async (event) => {
    event.preventDefault();
    const newClassData = { name: newClass.name, priority: newClass.priority };
    const docRef = await addClass(user.uid, newClassData);
    setClasses([...classes, { ...newClassData, id: docRef.id }]);
    setNewClass({ name: "", priority: 1 });
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    const classData = classes.find(cls => cls.name === newTask.className);
    if (!classData) {
      console.error("授業が見つかりません");
      return;
    }

    const now = new Date();
    const dueDate = new Date(newTask.date);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      console.error("提出期限が過ぎた課題は除外します");
      return;
    }

    const task = {
      title: `${newTask.title} (${newTask.className})`,
      start: dueDate,
      end: dueDate,
      allDay: true,
      classPriority: classData.priority,
      daysUntilDue,
      priority: classData.priority * daysUntilDue,
      color: getColor(classData.priority * daysUntilDue)
    };

    try {
      await addTask(user.uid, task);
      setEvents([...events, task]);
      setNewTask({ title: "", date: "", className: "" });
    } catch (error) {
      console.error("課題の追加に失敗しました", error);
    }
  };

  const updateTaskPriorities = (updatedClasses) => {
    const updatedEvents = events.map(event => {
      const className = event.title.split('(')[1].slice(0, -1);
      const classData = updatedClasses.find(cls => cls.name === className);
      if (!classData) return event;

      const now = new Date();
      const dueDate = new Date(event.start);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      const priority = classData.priority * daysUntilDue;

      return { ...event, classPriority: classData.priority, daysUntilDue, priority, color: getColor(priority) };
    });

    setEvents(updatedEvents);
  };

  const getColor = (priority) => {
    if (priority <= 3) return "red";
    if (priority <= 6) return "orange";
    return "green";
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: "5px",
      color: "white",
      border: "0",
    };
    return { style };
  };

  const getAgendaContent = (event) => `${event.title}`;

  return (
    <div>
      <h1>課題提出カレンダー</h1>

      <h2>授業名と優先順位の追加</h2>
      <form onSubmit={handleClassSubmit}>
        <input
          type="text"
          placeholder="授業名"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="優先順位"
          value={newClass.priority}
          onChange={(e) => setNewClass({ ...newClass, priority: e.target.value })}
        />
        <button type="submit">授業追加</button>
      </form>

      <h2>授業の一覧</h2>
      <ul>
        {classes.map((cls, index) => (
          <li key={index}>
            {cls.name} - 優先順位: {cls.priority}
          </li>
        ))}
      </ul>

      <h2>課題の追加</h2>
      <form onSubmit={handleTaskSubmit}>
        <input
          type="text"
          placeholder="課題名"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="date"
          value={newTask.date}
          onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
        />
        <select
          value={newTask.className}
          onChange={(e) => setNewTask({ ...newTask, className: e.target.value })}
        >
          <option value="">授業を選択</option>
          {classes.map((cls, index) => (
            <option key={index} value={cls.name}>{cls.name}</option>
          ))}
        </select>
        <button type="submit">課題追加</button>
      </form>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={[Views.MONTH, Views.AGENDA]}
        components={{ agenda: { event: (event) => <span>{getAgendaContent(event)}</span> } }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default CalendarPage;