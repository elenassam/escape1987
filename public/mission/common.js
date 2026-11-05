/* 2~3차시 미션 웹앱 공통 데이터 */
window.M87 = {
  // 기사 문장: [id, english]  (id = 문단-문장)
  headline: 'Student Dies at Police Office — Police Say “Shock”',
  dateline: 'SEOUL, January 16, 1987 —',
  paras: [
    [['1-1', 'A university student died at a police office in Seoul on January 14.'], ['1-2', 'He was 21 years old.'], ['1-3', 'Police officers took him from his home early in the morning.'], ['1-4', 'They wanted to ask him about one of his friends.']],
    [['2-1', 'The police said the student died of shock.'], ['2-2', 'According to the police, an officer hit a desk loudly during questioning.'], ['2-3', 'The student was surprised and suddenly fell down.'], ['2-4', '“It was an accident. Nobody hurt him,” a police officer said.']],
    [['3-1', 'However, many things are still not clear.'], ['3-2', 'A doctor came to the room that day, but he did not talk to reporters.'], ['3-3', 'Reporters asked to see the doctor’s report, but the police said no.'], ['3-4', 'The student’s family also asked for the full report, but they could not see it.'], ['3-5', 'Nobody explained why the floor of the room was wet.']],
    [['4-1', 'A few days later, the police closed the case.'], ['4-2', 'Newspapers in Seoul used only one word: “shock.”'], ['4-3', 'Many people had questions, but no one answered them.']],
  ],
  pens: {
    pink: { name: '분홍 · 경찰의 주장', short: '경찰의 주장', desc: '경찰이 말한 내용을 전하는 문장이에요. said, according to 같은 표현을 찾아보세요.', need: ['2-1', '2-2', '2-4'], ok: ['2-3'],
      why: '2-1(The police said), 2-2(According to the police), 2-4(a police officer said)는 모두 경찰이 한 말이에요. 2-3도 경찰 설명의 일부라 칠해도 맞아요.' },
    yellow: { name: '노랑 · 공개되지 않은 기록', short: '공개되지 않은 기록', desc: '기자나 가족이 보여 달라고 요청했지만, 끝내 볼 수 없었던 기록(보고서)이 나오는 문장이에요.', need: ['3-3', '3-4'], ok: [],
      why: '기자들은 의사의 보고서를(3-3), 가족은 전체 보고서를(3-4) 보여 달라고 했지만 볼 수 없었어요. 기록이 공개되지 않았다는 건 무언가 숨기고 있다는 신호예요.' },
    blue: { name: '하늘 · 설명되지 않은 이상한 점', short: '설명되지 않은 이상한 점', desc: '이상한 일이 있었는데, 아무도 그 이유를 설명하지 않은 문장이에요.', need: ['3-2', '3-5'], ok: ['4-3'],
      why: '현장에 온 의사가 기자에게 아무 말도 하지 않았고(3-2), 방바닥이 왜 젖어 있었는지 아무도 설명하지 않았어요(3-5). 4-3(아무도 답하지 않음)도 칠해도 맞아요.' },
  },
  tf: [
    ['The student died at a hospital.', false, '1-1', 'died at a police office — 병원이 아니라 경찰 사무실이에요.'],
    ['Police officers took the student from his home.', true, '1-3', 'Police officers took him from his home.'],
    ['The police said an officer hit the student.', false, '2-2', 'an officer hit a desk — 학생이 아니라 책상을 쳤다고 했어요.'],
    ['The doctor talked to reporters about the room.', false, '3-2', 'he did not talk to reporters.'],
    ['The student’s family saw the full report.', false, '3-4', 'they could not see it.'],
    ['The police closed the case a few days later.', true, '4-1', 'A few days later, the police closed the case.'],
  ],
  cards: [
    ['A', '1-3', '‘쇼크의 진짜 뜻’ 카드', '의학의 쇼크 = 피가 잘 돌지 못해 피와 산소가 부족한 상태'],
    ['B', '2-4', '질식 vs 쇼크 비교표', '질식은 숨의 문제, 쇼크는 피 흐름의 문제'],
    ['C', '3-1', '의사의 메모', '바닥이 물로 흥건함 · 배가 불러 있음 · 폐에서 물소리'],
    ['D', '3-4', '원본 기록 (부검 소견)', '목·가슴의 멍 자국 · 폐의 출혈 반점 · “질식한 것으로 보임”'],
    ['E', '4-1', '보도 지시 쪽지', '“반드시 ‘쇼크사’라고만 쓸 것”'],
    ['F', '5-1', '목격 진술서 W-1', '숨을 쉬기 힘들어하는 것을 보았다'],
  ],
  fix: [
    { claim: 'The police said the student died of shock.', card: ['D'], frame: ['The autopsy findings suggest', '.'], ans: ['asphyxia'], why: '부검 소견(D)은 “질식한 것으로 보임”이었어요. 쇼크가 아니라 asphyxia(질식)를 시사해요.' },
    { claim: 'The student was surprised and suddenly fell down.', card: ['D', 'F'], frame: ['There were', 'on his neck and chest.'], ans: ['bruises'], why: '놀라서 쓰러졌다면 몸 여러 곳에 멍이 남을 이유가 없어요(D). 숨쉬기 힘들어했다는 진술(F)도 같은 쪽을 가리켜요.' },
    { claim: 'Nobody explained why the floor of the room was wet.', card: ['C'], frame: ['The doctor heard', 'in the lungs.'], ans: ['water'], why: '처음 온 의사는 바닥의 물을 보고, 폐에서 물소리를 들었어요(C). 물이 공기의 길로 들어갔다는 증거예요.' },
    { claim: 'Newspapers in Seoul used only one word: “shock.”', card: ['E'], frame: ['A note told newspapers to', 'only “shock.”'], ans: ['use', 'write'], why: '신문사 벽의 지시 쪽지(E)가 ‘쇼크사’라고만 쓰게 했어요. 신문이 스스로 고른 말이 아니었어요.' },
  ],
  bank: ['asphyxia', 'bruises', 'water', 'use', 'shock', 'blood', 'oxygen', 'heart'],
  core: [['의사의 관찰', true], ['부검 결과', true], ['과학적 근거', true], ['경찰관의 이름', false], ['그날 서울의 날씨', false]],
  // 비밀 제보서: 칸마다 자유 작문 + 무엇을 쓸지 안내 + 쓸 수 있는 표현(선택)
  tip: [
    { k: 'f_s1', h: '① WHAT', q: '언제, 어디서, 누가, 어떤 일을 당했나요?', need: '날짜(1987년 1월 14일) · 장소 · 사람', starters: ['On January 14, 1987,', 'a university student died at', 'in Seoul.'] },
    { k: 'f_s2', h: '② POLICE CLAIM', q: '경찰은 뭐라고 주장했고, 그 뒤에 무엇을 했나요?', need: 'said / claimed / according to 중 하나 + 경찰이 한 일', starters: ['The police said (that)', 'The police claimed (that)', 'According to the police,', 'They closed the case.'] },
    { k: 'f_s3', h: '③ TRUTH', q: '실제로는 무엇 때문에 숨졌나요? 주장과 진실을 나눠 보세요.', need: 'But 또는 However로 시작 · die of + 원인', starters: ['But', 'However,', 'he died of', 'during questioning.'] },
    { k: 'f_s4', h: '④ EVIDENCE', q: '그 진실을 보여 주는 증거는 무엇인가요? (2개 이상)', need: '몸에 남은 흔적이나 의사의 관찰 · 단서 수첩과 활동 3 참고', starters: ['The autopsy shows', 'The doctor heard', 'There were', 'The findings suggest'] },
    { k: 'f_s5', h: '⑤ WHY & REQUEST', q: '왜 세상이 알아야 하나요? 기자에게 무엇을 부탁하나요?', need: 'because + 이유 · Please + 부탁', starters: ['This matters because', 'If the world does not know,', 'Please', 'Tell the world the truth.'] },
  ],
  video: 'https://d8j0ntlcm91z4.cloudfront.net/user_3LIdbSxUmYLH0NWTySUFAr9ZeB7/hf_20261105_042637_7b132698-9bbc-465d-a018-ad4cb4631ce2.mp4',
};

