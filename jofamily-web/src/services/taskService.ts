import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CreateTaskInput, Task, TaskStatus, UserStats } from '../types/tasks';

const tasksCollection = collection(db, 'familyTasks');
const statsCollection = collection(db, 'userStats');

export function listenToTasks(callback: (tasks: Task[]) => void) {
  const q = query(tasksCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const tasks: Task[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      const dueDate = data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null;
      const completedAt = data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null;
      return {
        id: d.id,
        title: data.title ?? 'Untitled',
        description: data.description ?? '',
        assignedTo: data.assignedTo ?? '',
        assignedBy: data.assignedBy ?? '',
        status: (data.status as TaskStatus) ?? 'pending',
        priority: data.priority ?? 'medium',
        points: data.points ?? 10,
        dueDate,
        completedAt,
        createdAt,
      };
    });
    callback(tasks);
  });
}

export function listenToUserTasks(userId: string, callback: (tasks: Task[]) => void) {
  const q = query(tasksCollection, where('assignedTo', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const tasks: Task[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      const dueDate = data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null;
      const completedAt = data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null;
      return {
        id: d.id,
        title: data.title ?? 'Untitled',
        description: data.description ?? '',
        assignedTo: data.assignedTo ?? '',
        assignedBy: data.assignedBy ?? '',
        status: (data.status as TaskStatus) ?? 'pending',
        priority: data.priority ?? 'medium',
        points: data.points ?? 10,
        dueDate,
        completedAt,
        createdAt,
      };
    });
    callback(tasks);
  });
}

export async function createTask(input: CreateTaskInput) {
  const ref = await addDoc(tasksCollection, {
    title: input.title,
    description: input.description ?? '',
    assignedTo: input.assignedTo,
    assignedBy: input.assignedBy,
    status: 'pending',
    priority: input.priority,
    points: input.points,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    completedAt: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const updates: Record<string, unknown> = { status };
  if (status === 'completed') {
    updates.completedAt = serverTimestamp();
  }
  await updateDoc(doc(tasksCollection, taskId), updates);
}

export function listenToLeaderboard(callback: (stats: UserStats[]) => void) {
  const q = query(statsCollection, orderBy('totalPoints', 'desc'));
  return onSnapshot(q, (snap) => {
    const stats: UserStats[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        userId: d.id,
        userName: data.userName ?? 'Unknown',
        totalPoints: data.totalPoints ?? 0,
        completedTasks: data.completedTasks ?? 0,
        badges: data.badges ?? [],
      };
    });
    callback(stats);
  });
}

export async function awardPoints(userId: string, userName: string, points: number) {
  const ref = doc(statsCollection, userId);
  const current = await getDoc(ref);
  const data = current.exists() ? current.data() : {};
  const newTotal = (data.totalPoints ?? 0) + points;
  const newCompleted = (data.completedTasks ?? 0) + 1;
  const badges: string[] = data.badges ?? [];

  // Award badges
  if (newCompleted === 1 && !badges.includes('first-task')) {
    badges.push('first-task');
  }
  if (newCompleted === 10 && !badges.includes('10-tasks')) {
    badges.push('10-tasks');
  }
  if (newTotal >= 100 && !badges.includes('100-points')) {
    badges.push('100-points');
  }
  if (newTotal >= 500 && !badges.includes('500-points')) {
    badges.push('500-points');
  }

  await setDoc(
    ref,
    {
      userName,
      totalPoints: newTotal,
      completedTasks: newCompleted,
      badges,
    },
    { merge: true }
  );
}

export async function filterTasks(
  tasks: Task[],
  filters: {
    status?: TaskStatus[];
    priority?: string[];
    assignedTo?: string[];
    dueToday?: boolean;
  }
): Promise<Task[]> {
  return tasks.filter((task) => {
    if (filters.status && !filters.status.includes(task.status)) return false;
    if (filters.priority && !filters.priority.includes(task.priority ?? 'medium')) return false;
    if (filters.assignedTo && !filters.assignedTo.includes(task.assignedTo)) return false;
    if (filters.dueToday && task.dueDate) {
      const today = new Date();
      const isDueToday = 
        task.dueDate.getFullYear() === today.getFullYear() &&
        task.dueDate.getMonth() === today.getMonth() &&
        task.dueDate.getDate() === today.getDate();
      if (!isDueToday) return false;
    }
    return true;
  });
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const lowerQuery = query.toLowerCase();
  return tasks.filter((task) =>
    task.title.toLowerCase().includes(lowerQuery) ||
    (task.description ?? '').toLowerCase().includes(lowerQuery)
  );
}

// Task templates support
export async function createTaskFromTemplate(templateId: string, assignedTo: string): Promise<string> {
  const templatesCollection = collection(db, 'taskTemplates');
  const templateRef = doc(templatesCollection, templateId);
  const templateData = await getDoc(templateRef);
  
  if (!templateData.exists()) throw new Error('Template not found');
  
  const template = templateData.data();
  const ref = await addDoc(tasksCollection, {
    title: template.title,
    description: template.description ?? '',
    assignedTo,
    assignedBy: 'system',
    status: 'pending',
    priority: template.priority ?? 'medium',
    points: template.points ?? 10,
    dueDate: template.dueDate || null,
    completedAt: null,
    templateId: templateId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
