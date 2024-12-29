import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", date: "", className: "" });
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: "", priority: 1 });
  const [editClass, setEditClass] = useState({ name: "", priority: 1, index: -1 });

  useEffect(() => {
    if (classes.length > 0) {
      updateTaskPriorities(classes);
    }
  }, [classes]);

  const handleClassSubmit = (event) => {
    event.preventDefault();
    if (editClass.index >= 0) {
      const updatedClasses = [...classes];
      updatedClasses[editClass.index] = { name: editClass.name, priority: editClass.priority };
      setClasses(updatedClasses);
      setEditClass({ name: "", priority: 1, index: -1 });
    } else {
      setClasses([...classes, newClass]);
      setNewClass({ name: "", priority: 1 });
    }
  };

  const handleTaskSubmit = (event) => {
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

    setEvents([...events, task]);
    setNewTask({ title: "", date: "", className: "" });
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

  const handleEditClass = (index) => {
    setEditClass({ ...classes[index], index });
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
          value={editClass.index >= 0 ? editClass.name : newClass.name}
          onChange={(e) => editClass.index >= 0 ? setEditClass({ ...editClass, name: e.target.value }) : setNewClass({ ...newClass, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="優先順位"
          value={editClass.index >= 0 ? editClass.priority : newClass.priority}
          onChange={(e) => editClass.index >= 0 ? setEditClass({ ...editClass, priority: e.target.value }) : setNewClass({ ...newClass, priority: e.target.value })}
        />
        <button type="submit">{editClass.index >= 0 ? "授業を更新" : "授業追加"}</button>
      </form>

      <h2>授業の一覧</h2>
      <ul>
        {classes.map((cls, index) => (
          <li key={index}>
            {cls.name} - 優先順位: {cls.priority}
            <button onClick={() => handleEditClass(index)}>編集</button>
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