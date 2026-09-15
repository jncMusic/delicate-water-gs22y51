/**
 * .env 를 읽어 process.env 에 채운다.
 *
 * react-scripts 는 .env 를 웹팩 빌드 안에만 주입하기 때문에,
 * 빌드가 끝난 뒤 따로 실행되는 node 스크립트에는 값이 넘어오지 않는다.
 * 이미 들어 있는 환경 변수는 덮어쓰지 않는다 (배포 서비스의 설정이 우선).
 */
const fs = require("fs");
const path = require("path");

module.exports = function loadEnv() {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return process.env;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return process.env;
};
