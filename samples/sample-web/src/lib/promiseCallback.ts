export function create() {
  const p2: any = {};
  const p = new Promise((resolve, reject) => {
    p2.resolve = resolve;
    p2.reject = reject;
  });
  p.resolve = p2.resolve;
  p.reject = p2.reject;
  return p;
}

export async function state(p: any) {
  const t = {};
  return await Promise.race([p, t]).then(
    (v) => (v === t ? "pending" : "fulfilled"),
    () => "rejected"
  );
}

export async function set(p: any, value: any) {
  p.resolve(value);
}

export async function wait(p: any) {
  return await p;
}
