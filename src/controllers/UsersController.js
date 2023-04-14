const knex = require("../database/knex")
const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError")

class UsersController{
  async create(request, response){
    const {name, email, password} = request.body;

    if(!name){
      throw new AppError("Nome é obrigatório!")
     }

    const checkUserExists = await knex("users")
    .select()
    .where("email", email)

    console.log(checkUserExists)

    if(checkUserExists.length > 0){
      console.log(checkUserExists)
      throw new AppError("Este email já está em uso")
    }

    const hashedPassword = await hash(password, 8)

    await knex("users").insert({
      name, email, password: hashedPassword
    })

    return response.status(201).json()

  }

  async update(request, response){
    const { name, email, password, old_password } = request.body
    const { id } = request.params

    const user = await knex("users")
    .select()
    .where("id", id).first()
    
    if(!user) {
      throw new AppError("Usuário não encontrado")
    }

    const userWithUpdatedEmail = await knex("users")
    .select()
    .where("email", email).first()

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError("Este email já está em uso")
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if(password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
    }

    if(password && old_password) {
      const checkOldPasssword = await compare(old_password, user.password)
      if(!checkOldPasssword){
        throw new AppError("A senha antiga não confere")
      }

      user.password = await hash(password, 8)

  }

  await knex("users")
  .where("id", id)
  .update({
    name: user.name,
    email: user.email,
    password: user.password,
    updated_at: Date.now()
  })

  return response.json()
  
 }

}
  
module.exports = UsersController