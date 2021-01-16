import "./App.css"
import { useState } from "react"

function App() {
  const [todoInput, setTodoInput] = useState("")
  const [todos, setTodos] = useState<string[]>([])

  return (
    <div className="app">
      <header className="header">TODO app</header>

      <main className="app__main">
        <h1 className="app__title">This is a TODO app written with React</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const normalisedInput = todoInput.trim()

            if (normalisedInput.length === 0) {
              alert("What are you doing? Please enter a valid todo")
              setTodoInput(normalisedInput)
              return
            }

            setTodos((prevTodos) => prevTodos.concat(todoInput))
            setTodoInput("")
          }}
        >
          <label>
            Add TODO
            <input
              onChange={(event) => {
                setTodoInput(event.target.value)
              }}
              type="text"
              placeholder="Type in your TODO"
              value={todoInput}
              required={true}
            />
          </label>
          <input type="submit" value="Add" />
        </form>
        <ol>
          {todos.map((todo) => (
            <li>{todo}</li>
          ))}
        </ol>
      </main>

      <footer className="footer app__footer">by Xenon</footer>
    </div>
  )
}

export default App
