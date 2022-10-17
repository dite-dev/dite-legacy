import { execSync } from 'child_process';

const getAllPid = (): { pid: number; ppid: number }[] => {
  const rows = execSync('ps -A -o pid,ppid')
    .toString()
    .trim()
    .split('\n')
    .slice(1);

  return rows
    .map((row) => {
      const parts = row.match(/\s*(\d+)\s*(\d+)/);

      if (parts === null) {
        return null;
      }

      return {
        pid: Number(parts[1]),
        ppid: Number(parts[2]),
      };
    })
    .filter(<T>(input: null | undefined | T): input is T => {
      return input != null;
    });
};

const getAllChilds = (pid: number) => {
  const allPid = getAllPid();

  const ppidHash: Record<number, number[]> = {};

  const result: number[] = [];

  allPid.forEach((item) => {
    ppidHash[item.ppid] = ppidHash[item.ppid] || [];
    ppidHash[item.ppid].push(item.pid);
  });

  const find = (pid: number) => {
    ppidHash[pid] = ppidHash[pid] || [];
    ppidHash[pid].forEach((childPid) => {
      result.push(childPid);
      find(childPid);
    });
  };

  find(pid);
  return result;
};

const killPid = (pid: number, signal?: string | number) => {
  try {
    process.kill(pid, signal);
  } catch (err: any) {
    if (err.code !== 'ESRCH') {
      throw err;
    }
  }
};

export function treeKillSync(pid: number, signal?: string | number): void {
  if (process.platform === 'win32') {
    execSync('taskkill /pid ' + pid + ' /T /F');
    return;
  }

  const childs = getAllChilds(pid);
  childs.forEach(function (pid) {
    killPid(pid, signal);
  });

  killPid(pid, signal);
  return;
}
