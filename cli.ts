import { Octokit } from "octokit";
import * as fs from "fs";
import { Command } from "commander";
import Table from "cli-table";
import inquirer from "inquirer";

// import inquirer from "inquirer";
// var Table = require('cli-table');

const program = new Command();

program
  .name("rader-util")
  .description("CLI to gather tech rader data.")
  .version("0.0.1");

// program.command('split')
//   .description('Split a string into substrings and display as an array')
//   .argument('<string>', 'string to split')
//   .option('--first', 'display just the first substring')
//   .option('-s, --separator <char>', 'separator character', ',')
//   .action((str, options) => {
//     const limit = options.first ? 1 : undefined;
//     console.log(str.split(options.separator, limit));
//   });

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const collectfromgithub = async (token: string) => {
  const octokit = new Octokit({
    auth: token,
  });

  // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
  let page = 1;
  let { data } =
    await octokit.rest.activity.listReposStarredByAuthenticatedUser({
      page,
      per_page: 100,
    });
  const repo_data = data;
  while (true) {
    // 遍历仓库
    repo_data.push(...data);
    if (data.length < 100) {
      break;
    }
    page++;
    let { data } =
      await octokit.rest.activity.listReposStarredByAuthenticatedUser({
        page,
        per_page: 100,
      });
  }
  const rader_list = [];
  for (const repo of repo_data) {
    // 打印仓库名称
    rader_list.push({
      name: repo.name,
      url: repo.html_url,
    });
  }
  let table = new Table({
    head: ["name", "url"],
    rows: rader_list.map((x, ind) => {
      return [x.name, x.url];
    }),
  });
  const jsonData = JSON.stringify(rader_list);
  console.log(table.toString());

  await fs.writeFile("data.json", jsonData, (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });
};

const show_rader_list = async () => {
  fs.readFile("data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    const objs: [
      {
        name: string;
        url: string;
      },
    ] = JSON.parse(data.toString());
    // console.log(objs)
    let table = new Table({
      head: ["name", "url"],
      rows: objs.map((x, ind) => {
        return [x.name, x.url];
      }),
    });
    console.log(table.toString());
  });
};

program
  .command("collect")
  .description("Collect stared repo from github")
  .option(
    "-t, --token <token>",
    "The token of github.",
    process.env.GITHUB_TOKEN,
  )
  .action((options) => {
    // const token = options.token || process.env.GITHUB_TOKEN;
    if (!options.token) {
      console.log(
        "Please set the GITHUB_TOKEN environment variable or pass it with --token.",
      );
      process.exit(1);
    }
    collectfromgithub(options.token);
  });

program
  .command("show")
  .description("Show rader data json")
  .action(() => {
    show_rader_list();
  });

// 创建一个名为 `greet` 的命令
program
  .command("greet")
  .description("Greets the user.")
  .option("-t, --to_file <file>", "The file of output.", "to_data.json")
  .option("-f, --from_file <file>", "The file of output.", "data.json")
  .action((options) => {
    // rawlist({
    //   choices: [
    //     { name: 'adopt', value: 'adopt' },
    //     { name: 'trial', value: 'trial' },
    //     { name: 'assess', value: 'assess' },
    //     { name: 'hold', value: 'hold' },
    //   ],
    //   message: 'What is the repo ring? ',
    // }).then((answer: string) => {
    //   const name = answer;
    //   console.log(`Hello, ${name}!`);
    // })
    fs.readFile(options.file, async (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const objs: [
        {
          name: string;
          url: string;
          ring: string;
          isNew: string;
          quadrant: string;
          description: string;
        },
      ] = JSON.parse(data.toString());

      process.on("exit", () => {
        // 保存已修改的数据
        fs.writeFileSync(options.to_file, JSON.stringify(objs), {
          encoding: "utf8",
          c: "w",
        });
        console.log("\n");
        console.log("save file exit");
        // 退出进程
        process.exit(0);
      });
      process.on("SIGINT", () => {
        // 保存已修改的数据
        fs.writeFileSync(options.to_file, JSON.stringify(objs), {
          encoding: "utf8",
          c: "w",
        });
        console.log("\n");
        console.log("save file exit");
        // 退出进程
        process.exit(0);
      });
      process.on("SIGTERM", () => {
        // 保存已修改的数据
        fs.writeFileSync(options.to_file, JSON.stringify(objs), {
          encoding: "utf8",
          c: "w",
        });
        console.log("\n");
        console.log("save file exit");
        // 退出进程
        process.exit(0);
      });
      for (const obj of objs) {
        const objtable = new Table({
          head: ["name", "url", "isNew", "quadrant", "ring", "description"],
          rows: [
            [
              obj.name,
              obj.url,
              obj.isNew || "",
              obj.quadrant || "",
              obj.ring || "",
              obj.description || "",
            ],
          ],
        });
        console.log(objtable.toString());
        await inquirer
          .prompt([
            {
              type: "rawlist",
              name: "quadrant",
              message: "Which is better?",
              choices: ["adopt", "trial", "assess", "hold"],
            },
            {
              type: "rawlist",
              name: "isNew",
              message: "Which is better?",
              choices: ["TRUE", "FALSE"],
            },
            {
              type: "rawlist",
              name: "ring",
              message: "Which is better?",
              choices: [
                "tools",
                "techniques",
                "platforms",
                "languages & frameworks",
              ],
            },
            {
              type: "input",
              name: "description",
              message: "What is your description? ",
              oncancel: async () => {
                fs.writeFileSync(options.to_file, JSON.stringify(objs));
                console.log("save file");
                // 退出进程
                process.exit(0);
              },
            },
          ])
          .then((answers) => {
            console.log(answers);
            obj.isNew = answers.isNew;
            obj.ring = answers.ring;
            obj.quadrant = answers.quadrant;
            obj.description = answers.description;
            // console.info('Answer:', answers.reptile);
            const newobjtable = new Table({
              head: ["name", "url", "isNew", "quadrant", "ring", "description"],
              rows: [
                [
                  obj.name,
                  obj.url,
                  obj.isNew || "",
                  obj.quadrant || "",
                  obj.ring || "",
                  obj.description || "",
                ],
              ],
            });
            console.log(newobjtable.toString());
          });
      }
    });
  });

program.parse();
