# Node + TypeScript + Fastify + Drizzle + Biome + Docker

Adicione atividades que te fazem bem e que você quer continuar
praticando toda semana.

<p align="center">
  <img alt="in.orbit" src="./src/assets/logo.svg" >
</p>

<h1 align="center">
	<img alt="in.orbit" src="./src/assets/cover.png" />
</h1>

## 🧪 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- [Node](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/)
- [Drizzle](https://orm.drizzle.team/)
- [Biome](https://biomejs.dev/)
- [Docker](https://www.docker.com/)

Para mais detalhes, veja o **[package.json](./package.json)**.

## 🚀 Como executar

Como pré-requisitos, é necessário instalar o [Node](https://nodejs.org/en/) e o [Yarn](https://classic.yarnpkg.com/en/docs/install/) em suas versões LTS.

Cumprindo os pré-requisitos, clone o projeto e acesse a pasta clonada.

```bash
$ git clone https://github.com/aleessandrohr/nlw-pocket-backend
$ cd nlw-pocket-backend
```

Para iniciá-lo, siga os passos abaixo:

```bash
# Instalar as dependências
$ yarn

# Iniciar o Banco de Dados
$ yarn docker:compose

# Gerar as migrations
$ yarn drizzle-kit:generate

# Rodar as migrations
$ yarn drizzle-kit:migrate

# Adicionar dados iniciais no Banco de Dados (opcional)
$ yarn seed

# Buildar o projeto
$ yarn build

# Iniciar o projeto
$ yarn start
```

O app estará disponível no seu browser pelo endereço [http://localhost:3333](http://localhost:3333).

## 💻 Projeto

Adicione atividades que te fazem bem e que você quer continuar
praticando toda semana.

Este é um projeto desenvolvido durante a **[Next Level Week Together](https://nextlevelweek.com/)**, apresentada dos dias 09 a 12 de setembro de 2024.

## 🔖 Layout

Você pode visualizar o layout do projeto através do link abaixo:

- [Layout Web](https://www.figma.com/community/file/1415093862269754302/nlw-pocket-js-in-orbit)

Lembrando que você precisa ter uma conta no [Figma](https://figma.com/).

## 📝 License

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---
