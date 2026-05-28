-- Local Supabase prototype seed.
-- Development sandbox data only; not intended for remote Supabase.

insert into public.numbers (
  id,
  title,
  musicxml_url,
  ar_url,
  mr_url,
  vocal_url
)
overriding system value
values
  (1, 'SONG01_유고집', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG01_유고집/SONG01_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG01_유고집/SONG01_MR.mp3', null),
  (2, 'SONG02_그녀의탄생과죽음', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG02_그녀의탄생과죽음/SONG02_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG02_그녀의탄생과죽음/SONG02_MR.mp3', null),
  (3, 'SONG03_아무도모른다', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG03_아무도모른다/SONG03_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG03_아무도모른다/SONG03_MR.mp3', null),
  (4, 'SONG04_NUMBER7', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG04_NUMBER7/SONG04_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG04_NUMBER7/SONG04_MR.mp3', null),
  (5, 'SONG05_눈물이나', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG05_눈물이나/SONG05_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG05_눈물이나/SONG05_MR.mp3', null),
  (6, 'SONG06_그녀를만나면', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG06_그녀를만나면/SONG06_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG06_그녀를만나면/SONG06_MR.mp3', null),
  (7, 'SONG07_거짓말이아니야', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MUSIC_SHEET.musicxml.xml', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MIDI_ALL.mp3'),
  (8, 'SONG08_신인탄생', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG08_신인탄생/SONG08_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG08_신인탄생/SONG08_MR.mp3', null),
  (9, 'SONG09_글자그대로', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG09_글자그대로/SONG09_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG09_글자그대로/SONG09_MR.mp3', null),
  (10, 'SONG10_MUSE', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG10_MUSE/SONG10_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG10_MUSE/SONG10_MR.mp3', null),
  (11, 'SONG11_섬세한팬레터', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG11_섬세한팬레터/SONG11_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG11_섬세한팬레터/SONG11_MR.mp3', null),
  (12, 'SONG12_투서', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG12_투서/SONG12_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG12_투서/SONG12_MR.mp3', null),
  (13, 'SONG13_글자그대로Rep', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG13_글자그대로Rep/SONG13_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG13_글자그대로Rep/SONG13_MR.mp3', null),
  (14, 'SONG14_별이반짝이는시간', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG14_별이반짝이는시간/SONG14_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG14_별이반짝이는시간/SONG14_MR.mp3', null),
  (15, 'SONG15_생의반려', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG15_생의반려/SONG15_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG15_생의반려/SONG15_MR.mp3', null),
  (151, 'SONG15a_별이반짝이는시간Rep', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG15a_별이반짝이는시간Rep/SONG15a_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG15a_별이반짝이는시간Rep/SONG15a_MR.mp3', null),
  (16, 'SONG16_거울', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_MUSIC_SHEET.musicxml.xml', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_MR.mp3', null),
  (17, 'SONG17_고백', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG17_고백/SONG17_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG17_고백/SONG17_MR.mp3', null),
  (18, 'SONG18_해진의편지', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG18_해진의편지/SONG18_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG18_해진의편지/SONG18_MR.mp3', null),
  (19, 'SONG19_내가죽었을때', null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG19_내가죽었을때/SONG19_AR.mp3', 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG19_내가죽었을때/SONG19_MR.mp3', null),
  (20, 'SONG20_CURTAINCALL', null, null, null, null),
  (99, 'SONG99_ETC', null, null, 'file:///E:/04.Musical/08.팬레터/01.넘버/SONG99_ETC/SONG_ETC_MuseRep_MR.mp3', null)
on conflict (id) do update set
  title = excluded.title,
  musicxml_url = excluded.musicxml_url,
  ar_url = excluded.ar_url,
  mr_url = excluded.mr_url,
  vocal_url = excluded.vocal_url;

insert into public.members (
  id,
  nickname,
  member_type,
  castings
)
overriding system value
values
  (1, '주언', 'player', array['김환태']),
  (2, '카일', 'player', array['정세훈']),
  (3, '기묘', 'player', array['정세훈']),
  (4, '재럼', 'player', array['김해진']),
  (5, '두기 이켄가', 'player', array['김해진']),
  (6, '듀이', 'player', array['히카루']),
  (7, '폴라리스', 'player', array['히카루']),
  (8, '까미', 'player', array['이윤']),
  (9, '종욱', 'player', array['이윤']),
  (10, '윤슬', 'player', array['이태준']),
  (11, '북구', 'player', array['이태준']),
  (12, '죠죠', 'player', array['김수남']),
  (13, '지예', 'player', array['김수남']),
  (14, '앙리', 'direction', array['메인']),
  (15, '도마', 'direction', array['극본']),
  (16, '에반', 'direction', array['시각']),
  (17, '레이', 'direction', array['미정']),
  (18, '머피', 'direction', array['음향']),
  (19, '타니', 'direction', array['엔지니어']),
  (20, '아리', 'direction', array['운영']),
  (21, '뇽뇽', 'direction', array['미정'])
on conflict (id) do update set
  nickname = excluded.nickname,
  member_type = excluded.member_type,
  castings = excluded.castings;

insert into public.works (
  id,
  number_id,
  member_id,
  casting_name,
  file_name,
  file_url
)
overriding system value
values
  (1, 1, 6, '히카루', 'take_03.wav', '/recordings/dewey/song01/take_03.wav'),
  (2, 1, 7, '히카루', 'take_01.wav', '/recordings/polaris/song01/take_01.wav')
on conflict (id) do update set
  number_id = excluded.number_id,
  member_id = excluded.member_id,
  casting_name = excluded.casting_name,
  file_name = excluded.file_name,
  file_url = excluded.file_url;

insert into public.comments (
  id,
  work_id,
  member_id,
  text
)
overriding system value
values
  (1, 1, 14, '첫 호흡은 안정적입니다. 12마디 전 자음 타이밍을 더 선명하게 맞춰주세요.'),
  (2, 1, 19, '후렴 에너지는 좋습니다. 마지막 음은 조금 더 가볍게 정리해보면 좋겠습니다.')
on conflict (id) do update set
  work_id = excluded.work_id,
  member_id = excluded.member_id,
  text = excluded.text;
