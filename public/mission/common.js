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
    yellow: { name: '노랑 · 확인된 사실', short: '확인된 사실', desc: '기자가 사실로 전하는 문장이에요. 언제, 어디서, 무슨 일이 있었고 그 뒤 어떻게 되었는지 찾아보세요. (경찰이 한 말은 분홍)', need: ['1-1', '1-3', '4-1'], ok: ['1-2', '1-4', '4-2'],
      why: '학생이 경찰 사무실에서 숨졌다(1-1), 경찰이 학생을 집에서 데려갔다(1-3), 경찰이 며칠 뒤 사건을 종결했다(4-1)는 누가 봐도 실제로 일어난 일이에요. 1-2, 1-4, 4-2도 칠해도 맞아요.' },
    blue: { name: '하늘 · 풀리지 않은 의문', short: '풀리지 않은 의문', desc: '보여 주지 않은 기록, 아무도 설명하지 않은 일처럼 아직 답을 모르는 문장이에요. not, nobody, no one을 찾아보세요.', need: ['3-2', '3-3', '3-4', '3-5'], ok: ['3-1', '4-3'],
      why: '의사는 기자에게 말하지 않았고(3-2), 보고서는 기자에게도(3-3) 가족에게도(3-4) 공개되지 않았고, 바닥이 왜 젖었는지 아무도 설명하지 않았어요(3-5). 3-1, 4-3도 칠해도 맞아요. 이 문장들이 활동 3에서 증거로 풀어야 할 질문이에요.' },
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
    { k: 'f_s1', h: '① WHAT', q: '언제, 어디서, 누가, 어떤 일을 당했나요?', need: '날짜는 기사에서 직접 찾아 쓰기 · 장소 · 누가 어떻게 되었는지', starters: ['a university student', 'died at'] },
    { k: 'f_s2', h: '② POLICE CLAIM', q: '경찰은 뭐라고 주장했고, 그 뒤에 무엇을 했나요?', need: 'said / claimed / according to 중 하나 + 경찰이 한 일', starters: ['The police claimed (that)', 'According to the police,'] },
    { k: 'f_s3', h: '③ TRUTH', q: '실제로는 무엇 때문에 숨졌나요? 주장과 진실을 나눠 보세요.', need: 'But 또는 However로 시작 · die of + 원인', starters: ['However,', 'died of'] },
    { k: 'f_s4', h: '④ EVIDENCE', q: '그 진실을 보여 주는 증거는 무엇인가요? (2개 이상)', need: '몸에 남은 흔적이나 의사의 관찰 · 단서 수첩과 활동 3 참고', starters: ['The autopsy shows', 'There were'] },
    { k: 'f_s5', h: '⑤ WHY & REQUEST', q: '왜 세상이 알아야 하나요? 기자에게 무엇을 부탁하나요?', need: 'because + 이유 · Please + 부탁', starters: ['because', 'Please'] },
  ],
  words: [
    ['', [['evidence', '증거'], ['record', '기록'], ['witness', '목격자'], ['claim (claimed)', '주장하다 (주장했다)'], ['prove (proved)', '증명하다 (증명했다)'], ['must', '~임에 틀림없다 (강한 확신)'], ['may', '~일지도 모른다 (가능성)'], ['can’t', '~일 리가 없다 (강한 부정)'], ['blood', '피'], ['heart', '심장'], ['oxygen', '산소'], ['carry', '운반하다'], ['pump', '펌프처럼 밀어 보내다'], ['asphyxia', '질식'], ['shock', '(의학) 쇼크'], ['floor', '바닥'], ['lungs', '폐'], ['hear (heard)', '듣다 (들었다)'], ['neck', '목'], ['chest', '가슴'], ['bruise', '멍'], ['bleeding', '출혈'], ['findings', '관찰·검사 결과'], ['suggest', '(가능성을) 나타내다, 시사하다'], ['die of ~', '~로 죽다'], ['according to ~', '~에 따르면'], ['confirm', '확인해 주다'], ['explanation', '설명'], ['truth', '진실'], ['hide', '숨기다'], ['report', '알리다, 보도하다'], ['autopsy', '부검'], ['cause of death', '사망 원인'], ['university student', '대학생'], ['police office', '경찰 사무실'], ['police officer', '경찰관'], ['take (took)', '데려가다 (데려갔다)'], ['early in the morning', '이른 아침에'], ['one of his friends', '그의 친구 중 한 명'], ['questioning', '조사, 심문'], ['hit (hit)', '치다 (쳤다)'], ['loudly', '큰 소리로'], ['surprised', '놀란'], ['suddenly', '갑자기'], ['fall down (fell down)', '쓰러지다 (쓰러졌다)'], ['accident', '사고'], ['hurt', '다치게 하다'], ['However,', '그러나, 하지만'], ['not clear', '분명하지 않은'], ['reporter', '기자'], ['ask to ~ (asked to ~)', '~하게 해 달라고 요청하다'], ['ask for ~ (asked for ~)', '~을 요청하다'], ['full report', '전체 보고서'], ['could not ~', '~할 수 없었다'], ['nobody / no one', '아무도 ~않다'], ['explain (explained)', '설명하다 (설명했다)'], ['wet', '젖은'], ['a few days later', '며칠 뒤'], ['case', '사건'], ['close the case', '사건을 종결하다'], ['newspaper', '신문'], ['answer (answered)', '답하다 (답했다)'], ['correspondent', '특파원'], ['stay hidden', '계속 숨겨져 있다'], ['remain unanswered', '답이 없는 채로 남아 있다']]],
  ],
  demoTip: [['codename', 'Truth Seekers'], ['f_s1', 'On January 14, 1987, a university student died at a police office in Seoul.'], ['f_s2', 'The police claimed that he died of shock. They closed the case a few days later.'], ['f_s3', 'However, he died of asphyxia during questioning.'], ['f_s4', 'The autopsy shows bruises on his neck and chest. The doctor heard water in the lungs.'], ['f_s5', 'This matters because the truth is hidden. Please tell the world the truth.']],
  video: 'https://d8j0ntlcm91z4.cloudfront.net/user_3LIdbSxUmYLH0NWTySUFAr9ZeB7/hf_20261105_042637_7b132698-9bbc-465d-a018-ad4cb4631ce2.mp4',
};

