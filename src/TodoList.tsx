import { FC } from "react"
import { Todos } from "./structs/todos"
import "./TodoList.css"

export const TodoList: FC<{
  onComplete: (id: number, isCompleted: boolean) => unknown
  onEdit: (id: number, name: string) => unknown
  onEditModeToggle: (id: number) => unknown
  onDelete: (index: number) => unknown
  onCopy: (index: number, name: string) => unknown
  onMoveDown: (index: number) => unknown
  onMoveUp: (index: number) => unknown
  todos: Todos
}> = (props) => {
  const {
    onEdit,
    onEditModeToggle,
    onComplete,
    onDelete,
    onCopy,
    onMoveDown,
    onMoveUp,
    todos,
  } = props
  return (
    <ol className="todo-list">
      {todos.map((todo, todoIndex) => (
        <li key={todo.id}>
          <div className="todo-list-item">
            {todo.isInEditMode ? (
              <input
                type="text"
                value={todo.name}
                onChange={(event) => {
                  onEdit(todo.id, event.target.value)
                }}
              />
            ) : (
              <div className="todo-list-item__text-container">
                <span
                  className={`todo-list-item__text ${
                    todo.isCompleted ? "todo-list-item__text--completed" : ""
                  }`}
                >
                  {todo.name}
                </span>

                <input
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={(event) => {
                    onComplete(todo.id, event.target.checked)
                  }}
                />
              </div>
            )}
            <div className="todo-list-item__buttons">
              <button
                className="button"
                onClick={() => {
                  onEditModeToggle(todo.id)
                }}
              >
                Edit
              </button>

              <button
                className="button"
                onClick={() => {
                  onDelete(todoIndex)
                }}
              >
                Delete
              </button>

              <button
                className="button"
                onClick={() => {
                  onCopy(todoIndex, todo.name)
                }}
              >
                Copy
              </button>

              <button
                className="button"
                onClick={() => {
                  onMoveDown(todoIndex)
                }}
                aria-label="Move down"
                disabled={todos.length === todoIndex + 1}
              >
                ⬇
              </button>

              <button
                className="button"
                onClick={() => {
                  onMoveUp(todoIndex)
                }}
                aria-label="Move up"
                disabled={0 === todoIndex}
              >
                ⬆
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
