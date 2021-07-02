
let paths = [
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/keys.json",
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/metrical.json",
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/poets.json",
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/titles.json",
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/tunes.json",
    "/var/www/html/csycms/ahdev/public/json/seventh-day-adventist-hymnal/years.json",
]

const fs = require("fs");

for (let i in paths) {
    let content = fs.readFileSync(paths[i], "utf-8");
    content = JSON.parse(content)
    Object.keys(content).map(number => {
        if(number > 695)delete content[number]
    })
    fs.writeFileSync(paths[i], JSON.stringify(content))
}
