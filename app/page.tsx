export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-sky-700">
          Babycare
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">
          家庭育儿协作的基础应用已就绪
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Next.js App Router、TypeScript、Tailwind、ESLint 和 Docker 基线已经在项目根目录搭建完成。
        </p>
      </section>
    </main>
  );
}
