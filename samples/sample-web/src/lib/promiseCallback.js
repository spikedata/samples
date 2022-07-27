export function create() {
  let p2 = {};
  let p = new Promise((resolve, reject) => {
    p2.resolve = resolve;
    p2.reject = reject;
  });
  p.resolve = p2.resolve;
  p.reject = p2.reject;
  return p;
}

export async function state(p) {
  const t = {};
  return await Promise.race([p, t]).then(
    (v) => (v === t ? "pending" : "fulfilled"),
    () => "rejected"
  );
}

export async function set(p, value) {
  p.resolve(value);
}

export async function wait(p) {
  return await p;
}
