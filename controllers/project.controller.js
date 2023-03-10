const { PrismaClient } = require("@prisma/client");
var moment = require("moment");
const prisma = new PrismaClient();

module.exports = {
  allProjects: async (req, res) => {
    if (req.session.user) {
      const projects = await prisma.project.findMany({
        include: {
          project_status: true,
          team: {
            include: { userId: true },
          },
        },
      });
      // console.log(projects[0].team);
      // console.log(JSON.stringify(projects) )
      res.render("projects", {
        rows: projects,
        bd: "Projects",
        card_title: "My Projects",
        user: req.session.user,
        moment: require("moment"),
      });
    } else {
      res.render("login", {
        message: { info: "You need to login first", type: "error" },
        fire: "fire",
      });
    }
  },
  myProjects: async (req, res) => {
    if (req.session.user) {
      const projects = await prisma.project.findMany({
        include: {
          project_status: true,
          team: {
            include: { userId: true },
          },
          task: true,
          created_by: true,
        },
        where: {
          userUser_id: req.session.user.user_id,
        },
        orderBy: {
          project_id: "desc",
        },
      });
      const tasks = await prisma.task.groupBy({
        by: ["projectProject_id"],
        _count: {
          task_id: true,
        },
      });
      const taskCount = await prisma.task.aggregate({
        _count: {
          _all: true,
        },
        where: {
          projectProject_id: 1,
        },
      });
      const milestoneCount = await prisma.milestone.aggregate({
        _count: {
          _all: true,
        },
        where: {
          projectProject_id: 1,
        },
      });
      console.log(projects);
      console.log(tasks);
      console.log(taskCount);
      console.log(milestoneCount);
      res.render("my_projects", {
        bd: "Projects",
        user: req.session.user,
        projects: projects,
        title: "My Projects",
        taskCount,
        milestoneCount,
      });
    } else {
      res.render("login", {
        message: { info: "You need to login first", type: "error" },
        fire: "fire",
      });
    }
  },
  projectForm: (req, res) => {
    if (req.session.user) {
      res.render("project_form", {
        user: req.session.user,
        title: "New Project",
      });
    }
  },
  newProject: async (req, res) => {
    // try {
    const { project_title, start_date, due_date, description } = req.body;
    if (req.session.user) {
      const project = await prisma.project.create({
        data: {
          title: project_title,
          start_date: new Date(start_date),
          due_date: new Date(due_date),
          description: description,
          userUser_id: req.session.user.user_id,
        },
      });
      console.log(project);
      res.redirect('/dashboard/projects')
      // res.render("project_form", {
      //   user: req.session.user,
      //   title: "New Project",
      //   message: "Project Created Successfuly",
      // });
    } else {
      res.render("login", {
        message: { info: "You need to login first", type: "error" },
        fire: "fire",
      });
    }
    // } catch (error) {

    // }
  },
};
