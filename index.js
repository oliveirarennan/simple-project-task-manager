const express = require('express')

const server = express()

server.use(express.json())

/**
 * array que atua como repositorio de dados
 */
const projects = [{id: 1, title: 'Project 1', tasks:['Get data for analysis']}]

/**
 * Middleware para contar o número de requisições
 */
function requestCount(req, res, next){
  console.count('Request count')
  return next()
}

server.use(requestCount)

/**
 * Middleware para verificar se o projeto existe dentro do array
 */
function checkProjectExists(req, res, next){
  const {id:projectId} = req.params
  const project = projects.find(project => project.id == projectId)

  if(!project){
    return res.status(400).json({message:"Project does not exists"})
  } 

  return next()
}
/**
 * Middleware para verificar se o titulo do projeto foi enviado
 */
function checkProjectTitle(req, res, next){
  const {title} = req.body

  if(!title){
    return res.status(400).json({error: 'Project name is required'})
  }

  return next()
}

/**
 * Middleware para verificar se o nome da tarefa foi enviado
 */
function taskName(req, res, next){
  const {task} = req.body

  if(!task){
    return res.status(400).json({error: 'Task name is required'})
  }

  return next()
}

// projects routes
/**
 * Rota que retorna todos os projetos
 */
server.get('/projects', (req, res)=>{
  try {
    res.json(projects)
  } catch (error) {
    res.status(400).json({message: error.message})
  }
})
/**
 * Request body: id, title
 * Cadastra um novo projeto
 */
server.post('/projects', (req, res)=>{
  const {id, title} = req.body

  try {

    if(!id|| !title) throw Error('id and title cannot be empty')
    const project = {
      id,
      title,
      tasks: []
    }

    projects.push(project)

    return res.json(projects)


  } catch (error) {
    res.status(400).json({message: error.message})
  }
})
/**
 * Route paramns: id
 * Request body: title
 * Altera o titulo do projeto com id presente no Route params
 */
server.put('/projects/:id', checkProjectExists, checkProjectTitle,(req, res)=>{
  const {id:projectId} = req.params
  const {title} = req.body

  try {
    const project = projects.find(project => project.id == projectId)
    project.title = title

    return res.json(project)
  } catch (error) {
    return res.status(500).json({error:error.message})    
  }
 

})
/**
 * Route params: id
 * Deleta o projeto cujo o id esta presente nos parametros da rota
 */
server.delete('/projects/:id', checkProjectExists, (req, res)=>{
  const {id:projectId} = req.params
  try {
    const projectIndex = projects.findIndex(project => projectId == project.id)
    projects.splice(projectIndex, 1)

    return res.send()
    
  } catch (error) {
    return res.status(500).json({error:error.message})  
  }
})

//tasks routes

/**
 * Route params: id
 * Request body: task
 * Adiciona uma nova tarefa no projeto via id
 */
server.post('/projects/:id/tasks', checkProjectExists, taskName, (req, res)=>{
  const {id:projectId} = req.params
  const {task} = req.body
  try {
    const project = projects.find(project =>(project.id == projectId))

    project.tasks.push(task)

    return res.json(project)
  } catch (error) {
    return res.status(500).json({error:error.message})  
  }
})

server.listen(3000, ()=>{
  console.info('Server is running on localhost:3000')
})