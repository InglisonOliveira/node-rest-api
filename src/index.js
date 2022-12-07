const http = require('http')

const wait = (time) =>
  new Promise(resolve =>
    setTimeout(resolve, time)
  )

const todosDatabase = (() => {
  let idSequence = 1
  const todos = {}

  const insert = async (todo) => {
    await wait(500)
    const id = idSequence++
    const data = { ...todo, id }
    todos[id] = data
    return data
  }

  const list = async () => {
    await wait(100)
    return Object.values(todos)
  }

  const get = async (id) => {
    await wait(100)
    return todos[id]
  }

  const update = async (todo) => {
    await wait(500)
    todos[todo.id] = todo
    return todo
  }

  const del = async (id) => {
    await wait(500)
    delete todos[id]
  }

  return {
    insert,
    list,
    get,
    update,
    del,
  }

})()

const JsonHeader = { 'Content-Type' : 'application/json'}

const server = http.createServer((request, response) => {
  // Caso o servidor receba uma requisição GET em /hello/:nome o servidor tem que retornar ${nome}
  if(request.method === 'GET' && /^\/hello\/\w+$/.test(request.url)) {
    const [,,name] = request.url.split('/')
    response.writeHead(200)
    response.end(`hello ${name}! \n`)
    return
  }

  // Caso o servidor receba uma requisição GET em /hello o servidor tem que retornar HELLO WORLD
  if(request.method === 'GET' && request.url.startsWith('/hello')) {
    response.writeHead(200)
    response.end('Hello Word')
    return
  }

  // POST /echo
  if (request.method === 'POST' && request.url.startWith('/echo')) {
    response.writeHead(200)
    request.pipe(response)
    return
  }

  // *****************
  // ** API TODOS ****
  // *****************
  // tarefa {id: title, text}

  // para criar um TODO, usaremos  o metodo POST no '/todos' vai retornar {"text": "string", "title": "string"}

  if(request.method === 'POST' && request.url.startsWith('/todos')) {
    let bodyRaw = ''

    request.on('data', data => bodyRaw += data)

    request.once('end', () => {
      const todo = JSON.parse(bodyRaw)
      todosDatabase.insert(todo)
        .then(inserted => {
          response.writeHead(201, JsonHeader)
          response.end(JSON.stringify(inserted))
        })
    })
    return
  }

  // para listar todos os TODOS, usamos o GET no '/todos'
  if (request.method === 'GET' && request.url.startWith('/todos')) {
    todosDatabase
      .list()
      .then(todos => {
        response.writeHead(200, JsonHeader)
        response.end(JSON.stringify({todos}))
      })
      return
  }



  // Para listar as informações de um TODO especifico, uso o GET no '/todos/:id'

  // para deletar um TODO, usamos o DELETE no '/todos/:id'

  // Para atualizar, uso um PUT no '/todos/:id'


  response.writeHead(404)
  response.end('Resource not found')

})

server.listen(3000, '0.0.0.0', () => {
  console.log('Server started')
})
