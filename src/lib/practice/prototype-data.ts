export type SubmissionState = 'not_recorded' | 'recorded' | 'submitted' | 'commented' | 'revision_requested';

export interface PracticeNumber {
  id: string;
  title: string;
  musicalTitle: string;
  category: string;
  dueLabel: string;
  roleName: string;
  status: SubmissionState;
  durationLabel?: string;
  mrUrl?: string;
  mrFileName?: string;
  arUrl?: string;
  arFileName?: string;
}

export interface PracticeTake {
  id: string;
  fileName: string;
  createdLabel: string;
  durationLabel: string;
  isSubmitted: boolean;
  audioUrl?: string;
}

export interface PracticeComment {
  id: string;
  timestampLabel: string;
  authorName: string;
  content: string;
}

export interface PracticeSubmission {
  id: string;
  takeId: string;
  submittedLabel: string;
  statusLabel: string;
  comments: PracticeComment[];
}

export interface PracticeStudioData {
  roleName: string;
  activeNumberId: string;
  numbers: PracticeNumber[];
  takes: PracticeTake[];
  submission: PracticeSubmission;
}

export const practiceStudioPrototype: PracticeStudioData = {
  roleName: '히카루',
  activeNumberId: 'song07-lie',
  numbers: [
    {
      id: 'song07-lie',
      title: 'SONG07_거짓말이아니야',
      musicalTitle: '팬레터',
      category: 'Number 07',
      dueLabel: '오늘 23:59',
      roleName: '히카루',
      status: 'revision_requested',
      durationLabel: '03:18',
      mrUrl: '/api/prototype-assets/song07-lie/mr',
      mrFileName: 'SONG07_MR.mp3',
      arUrl: '/api/prototype-assets/song07-lie/ar',
      arFileName: 'SONG07_AR.mp3',
    },
    {
      id: 'song16-mirror',
      title: 'SONG16_거울',
      musicalTitle: '팬레터',
      category: 'Number 16',
      dueLabel: '05-31',
      roleName: '히카루',
      status: 'submitted',
      durationLabel: '03:42',
      mrUrl: '/api/prototype-assets/song16-mirror/mr',
      mrFileName: 'SONG16_MR.mp3',
      arUrl: '/api/prototype-assets/song16-mirror/ar',
      arFileName: 'SONG16_AR.mp3',
    },
    {
      id: 'song05-tears',
      title: 'SONG05_눈물이나',
      musicalTitle: '팬레터',
      category: 'Number 05',
      dueLabel: '06-02',
      roleName: '히카루',
      status: 'not_recorded',
      durationLabel: '03:00',
    },
  ],
  takes: [
    {
      id: 'take-03',
      fileName: 'take_03.wav',
      createdLabel: '오늘 21:42',
      durationLabel: '03:18',
      isSubmitted: true,
    },
    {
      id: 'take-02',
      fileName: 'take_02.wav',
      createdLabel: '오늘 21:18',
      durationLabel: '03:15',
      isSubmitted: false,
    },
    {
      id: 'take-01',
      fileName: 'take_01.wav',
      createdLabel: '오늘 20:57',
      durationLabel: '03:12',
      isSubmitted: false,
    },
  ],
  submission: {
    id: 'submission-song07-week1',
    takeId: 'take-03',
    submittedLabel: '오늘 21:45',
    statusLabel: '재제출 필요',
    comments: [
      {
        id: 'comment-01',
        timestampLabel: '00:42',
        authorName: '앙리',
        content: '진입 박자가 MR보다 조금 늦어요. 앞 호흡을 짧게 가져가면 좋겠습니다.',
      },
      {
        id: 'comment-02',
        timestampLabel: '01:36',
        authorName: '타니',
        content: '상대 Role과 겹치는 구간이라 볼륨을 살짝 낮춰보세요.',
      },
      {
        id: 'comment-03',
        timestampLabel: '02:11',
        authorName: '앙리',
        content: '이 구간은 tone이 좋습니다. 다음 Recording에서는 발음만 더 또렷하게 가면 됩니다.',
      },
    ],
  },
};

export function submissionStateLabel(state: SubmissionState) {
  return {
    not_recorded: '녹음 없음',
    recorded: '녹음 있음',
    submitted: '제출 완료',
    commented: '코멘트 있음',
    revision_requested: '재제출 필요',
  }[state];
}