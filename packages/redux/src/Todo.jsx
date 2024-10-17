// /Users/jiabin/Desktop/workspace/build-your-own-x/packages/redux/src/Todo.jsx

import { useEffect, useMemo, useState } from 'react';
import { bindActionCreators, combineReducers, createStore } from './libs';


// Actions
const ADD_TODO = 'ADD_TODO';
const REMOVE_TODO = 'REMOVE_TODO';

const addTodo = (todo) => ({
  type: ADD_TODO,
  payload: todo,
});

const removeTodo = (index) => ({
  type: REMOVE_TODO,
  payload: index,
});

// Reducer
const initialState = []

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload];
    case REMOVE_TODO:
      return state.filter((_, i) => i !== action.payload)
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  todos: todoReducer,
  others: todoReducer
})
// Store
const store = createStore(rootReducer, { todos: [] });

// Components
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const dispatch = store.dispatch

  const boundActionCreators = useMemo(() => bindActionCreators({
    addTodo,
    removeTodo
  }, dispatch), [dispatch])

  useEffect(() => {
    const unSubscribe = store.subscribe((state) => {
      console.log('state :>> ', state);
      setTodos(state.todos)

    });
    return () => unSubscribe()
  })
  const [input, setInput] = useState('');

  const handleAddTodo = () => {
    if (input.trim()) {
      boundActionCreators.addTodo(input)
      setInput('');
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleAddTodo}>Add Todo</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo} <button onClick={() => boundActionCreators.removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};



export default TodoList;