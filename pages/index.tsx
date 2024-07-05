import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckSquare, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useSpring, animated } from '@react-spring/web';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Task {
  id: number;
  content: string;
  completed: boolean;
}

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface FanfareAnimationProps {
  isVisible: boolean;
}

const FanfareAnimation: React.FC<FanfareAnimationProps> = ({ isVisible }) => {
  const animation = useSpring({
    from: { y: -50, rotate: 0, scale: 0 },
    to: async (next) => {
      if (isVisible) {
        await next({ y: 0, rotate: 0, scale: 1 });
        await next({ rotate: 15 });
        await next({ rotate: -15 });
        await next({ rotate: 0 });
        await next({ y: 100, scale: 0 });
      }
    },
    config: { tension: 300, friction: 10 },
  });

  if (!isVisible) return null;

  return (
    <animated.div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      ...animation,
    }}>
      <img src="/fanfare.png" alt="Fanfare" style={{ width: '100px', height: '100px' }} />
    </animated.div>
  );
};

const TaskCalendarApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemType, setNewItemType] = useState<'task' | 'event' | null>(null);
  const [newEventDetails, setNewEventDetails] = useState({
    content: '',
    start: new Date(),
    end: new Date(),
  });
  const [showFanfare, setShowFanfare] = useState<boolean>(false);

  const addItem = (type: 'task' | 'event') => {
    if (type === 'task') {
      setTasks([...tasks, { id: Date.now(), content: newEventDetails.content, completed: false }]);
    } else {
      setEvents([...events, {
        id: Date.now(),
        title: newEventDetails.content,
        start: new Date(newEventDetails.start),
        end: new Date(newEventDetails.end),
      }]);
    }
    setShowAddModal(false);
    setNewItemType(null);
    setNewEventDetails({ content: '', start: new Date(), end: new Date() });
  };

  const completeTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    ));
    setShowFanfare(true);
    setTimeout(() => setShowFanfare(false), 1000);
  };

  const archiveTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">タスクと予定管理アプリ</h1>

      <FanfareAnimation isVisible={showFanfare} />

      <div className="flex justify-between mb-4">
        <Button onClick={() => setShowAddModal(true)}>
          新規追加
        </Button>
        <Button onClick={archiveTasks} variant="outline">
          <Archive className="mr-2 h-4 w-4" /> 完了タスクをアーカイブ
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl mb-4">新規追加</h2>
            <div className="flex space-x-4 mb-4">
              <Button onClick={() => setNewItemType('task')}>
                <CheckSquare className="mr-2 h-4 w-4" /> タスク
              </Button>
              <Button onClick={() => setNewItemType('event')}>
                <CalendarIcon className="mr-2 h-4 w-4" /> 予定
              </Button>
            </div>
            {newItemType && (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder={newItemType === 'task' ? 'タスクを入力' : '予定を入力'}
                  value={newEventDetails.content}
                  onChange={(e) => setNewEventDetails({...newEventDetails, content: e.target.value})}
                />
                {newItemType === 'event' && (
                  <>
                    <Input
                      type="datetime-local"
                      value={moment(newEventDetails.start).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setNewEventDetails({...newEventDetails, start: new Date(e.target.value)})}
                    />
                    <Input
                      type="datetime-local"
                      value={moment(newEventDetails.end).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => setNewEventDetails({...newEventDetails, end: new Date(e.target.value)})}
                    />
                  </>
                )}
                <Button onClick={() => addItem(newItemType)}>追加</Button>
              </div>
            )}
            <Button onClick={() => setShowAddModal(false)} className="mt-4">
              閉じる
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 pr-4 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">タスク</h2>
          <ul>
            {tasks.map(task => (
              <li key={task.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => completeTask(task.id)}
                  className="mr-2"
                />
                <span className={task.completed ? 'line-through' : ''}>
                  {task.content}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-2/3 pl-4">
          <h2 className="text-xl font-semibold mb-2">カレンダー</h2>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendarApp;