const feedbackItems = [
  {
    title: "1. Dashboard",
    body: "넘버 카드에서 전체 합창을 바로 재생하는 진입이 맞는지 확인해주세요."
  },
  {
    title: "2. Work",
    body: "본인 배역별 넘버 현황과 녹음/제출 흐름이 충분히 자연스러운지 봐주세요."
  },
  {
    title: "3. Score Viewer",
    body: "악보를 A4 페이지처럼 넘기는 구성이 실제 연습감에 가까운지 피드백해주세요."
  },
  {
    title: "4. Comments",
    body: "제출물 하위에 코멘트가 붙는 구조가 연출가 피드백 흐름에 맞는지 봐주세요."
  }
];

export function FeedbackCards() {
  return (
    <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {feedbackItems.map((item) => (
        <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-black">{item.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p>
        </article>
      ))}
    </section>
  );
}
