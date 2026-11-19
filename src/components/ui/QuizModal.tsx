import React, { useState, useEffect } from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { X, Trophy, Timer, CheckCircle2, AlertCircle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../../audio/soundEngine';

interface Question {
  id: number;
  questionTr: string;
  questionEn: string;
  options: { symbol: string; nameTr: string; nameEn: string }[];
  correctSymbol: string;
  explanationTr: string;
  explanationEn: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    questionTr: 'Elektronegatifliği en yüksek olan ve periyodik tablonun en aktif ametali hangisidir?',
    questionEn: 'Which element has the highest electronegativity (Pauling scale: 3.98)?',
    options: [
      { symbol: 'F', nameTr: 'Flor', nameEn: 'Fluorine' },
      { symbol: 'Cl', nameTr: 'Klor', nameEn: 'Chlorine' },
      { symbol: 'O', nameTr: 'Oksijen', nameEn: 'Oxygen' },
      { symbol: 'N', nameTr: 'Azot', nameEn: 'Nitrogen' }
    ],
    correctSymbol: 'F',
    explanationTr: 'Flor (F), 3.98 Pauling değeri ile en yüksek elektronegatifliğe sahip elementtir.',
    explanationEn: 'Fluorine (F) has the highest Pauling electronegativity of 3.98.'
  },
  {
    id: 2,
    questionTr: 'Oda sıcaklığında (298 K) sıvı halde bulunan tek metal hangisidir?',
    questionEn: 'Which is the only metallic element that is liquid at room temperature (298 K)?',
    options: [
      { symbol: 'Hg', nameTr: 'Cıva', nameEn: 'Mercury' },
      { symbol: 'Br', nameTr: 'Brom', nameEn: 'Bromine' },
      { symbol: 'Ga', nameTr: 'Galyum', nameEn: 'Gallium' },
      { symbol: 'Cs', nameTr: 'Sezyum', nameEn: 'Caesium' }
    ],
    correctSymbol: 'Hg',
    explanationTr: 'Cıva (Hg), erime noktası -38.8 °C (234.3 K) olan tek oda sıcaklığı sıvısı metaldir.',
    explanationEn: 'Mercury (Hg) melts at -38.8 °C (234.3 K), making it the only liquid metal at standard conditions.'
  },
  {
    id: 3,
    questionTr: 'Soy gazlar grubunda yer alan ve 4. periyotta bulunan element hangisidir?',
    questionEn: 'Which noble gas is located in Period 4 of the periodic table?',
    options: [
      { symbol: 'Ar', nameTr: 'Argon', nameEn: 'Argon' },
      { symbol: 'Kr', nameTr: 'Kripton', nameEn: 'Krypton' },
      { symbol: 'Xe', nameTr: 'Ksenon', nameEn: 'Xenon' },
      { symbol: 'Ne', nameTr: 'Neon', nameEn: 'Neon' }
    ],
    correctSymbol: 'Kr',
    explanationTr: 'Kripton (Kr, Z=36), 4. periyot 18. grupta (soy gazlar) yer alır.',
    explanationEn: 'Krypton (Kr, Z=36) is in Period 4, Group 18.'
  },
  {
    id: 4,
    questionTr: 'Paslanmaz çeliğin ana bileşeni olan ve yeryüzünde en çok üretilen geçiş metali hangisidir?',
    questionEn: 'Which transition metal is the primary constituent of steel and the most produced metal on Earth?',
    options: [
      { symbol: 'Fe', nameTr: 'Demir', nameEn: 'Iron' },
      { symbol: 'Cu', nameTr: 'Bakır', nameEn: 'Copper' },
      { symbol: 'Al', nameTr: 'Alüminyum', nameEn: 'Aluminium' },
      { symbol: 'Ti', nameTr: 'Titanyum', nameEn: 'Titanium' }
    ],
    correctSymbol: 'Fe',
    explanationTr: 'Demir (Fe, Z=26), BCC kristal kafesine sahip küresel metalurjinin temel taşıdır.',
    explanationEn: 'Iron (Fe, Z=26) is the backbone of metallurgy with a BCC crystal lattice.'
  },
  {
    id: 5,
    questionTr: 'Güneş kremlerinde UV ışınlarını absorbe eden parlak beyaz pigment (TiO₂) hangi elementten üretilir?',
    questionEn: 'Which element forms the bright white UV-blocking pigment TiO₂ used in sunscreens?',
    options: [
      { symbol: 'Ti', nameTr: 'Titanyum', nameEn: 'Titanium' },
      { symbol: 'Zn', nameTr: 'Çinko', nameEn: 'Zinc' },
      { symbol: 'Sn', nameTr: 'Kalay', nameEn: 'Tin' },
      { symbol: 'Pb', nameTr: 'Kurşun', nameEn: 'Lead' }
    ],
    correctSymbol: 'Ti',
    explanationTr: 'Titanyum (Ti, Z=22), Titanyum dioksit olarak UV ışığını son derece yüksek oranda kırar ve yansıtır.',
    explanationEn: 'Titanium (Ti, Z=22) dioxide is an exceptional UV absorber with a very high refractive index.'
  },
  {
    id: 6,
    questionTr: 'Evrende kütlece en bol bulunan (%74) ve yıldızların nükleer füzyon yakıtı olan element hangisidir?',
    questionEn: 'Which element is the most abundant in the universe (~74%) and powers stellar fusion?',
    options: [
      { symbol: 'H', nameTr: 'Hidrojen', nameEn: 'Hydrogen' },
      { symbol: 'He', nameTr: 'Helyum', nameEn: 'Helium' },
      { symbol: 'C', nameTr: 'Karbon', nameEn: 'Carbon' },
      { symbol: 'Fe', nameTr: 'Demir', nameEn: 'Iron' }
    ],
    correctSymbol: 'H',
    explanationTr: 'Hidrojen (H, Z=1), evrenin %74’ünü oluşturan en basit ve en bol elementtir.',
    explanationEn: 'Hydrogen (H, Z=1) makes up ~74% of baryonic mass in the cosmos.'
  }
];

export const QuizModal: React.FC = () => {
  const { isQuizOpen, setIsQuizOpen, language, elements, setSelectedElement } = usePeriodicStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = quizQuestions[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (!isQuizOpen || isFinished || isAnswered) return;

    if (timeLeft <= 0) {
      // Time up!
      handleAnswer('');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isQuizOpen, isFinished, isAnswered]);

  const handleAnswer = (symbol: string) => {
    if (isAnswered) return;
    setSelectedAnswer(symbol);
    setIsAnswered(true);

    if (symbol === currentQ.correctSymbol) {
      sound.playCorrect();
      setScore((prev) => prev + 100 + timeLeft * 10);
    } else {
      sound.playWrong();
    }
  };

  const nextQuestion = () => {
    sound.playSelect();
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      sound.playReactionSuccess();
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    sound.playWhoosh();
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(15);
    setIsFinished(false);
  };

  const inspectElementIn3D = (symbol: string) => {
    const el = elements.find((e) => e.symbol === symbol);
    if (el) {
      sound.playSelect();
      setSelectedElement(el);
      setIsQuizOpen(false);
    }
  };

  if (!isQuizOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-black/95 border border-white/15 text-slate-100 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'tr' ? 'Kimya Avcısı (Quiz Modu)' : 'Chemistry Hunter (Quiz)'}
              </h3>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {language === 'tr' ? `Skor: ${score} Puan` : `Score: ${score} Pts`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsQuizOpen(false)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {!isFinished ? (
            <>
              {/* Question Progress & Timer */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">
                  {language === 'tr' ? 'Soru' : 'Question'} {currentIdx + 1} / {quizQuestions.length}
                </span>

                <div className="flex items-center gap-1.5 font-mono">
                  <Timer className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                  <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {language === 'tr' ? currentQ.questionTr : currentQ.questionEn}
              </h4>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt) => {
                  const isCorrect = opt.symbol === currentQ.correctSymbol;
                  const isSelected = selectedAnswer === opt.symbol;

                  let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-900 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={opt.symbol}
                      onClick={() => handleAnswer(opt.symbol)}
                      disabled={isAnswered}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-mono font-black text-sm text-cyan-400">
                          {opt.symbol}
                        </span>
                        <span className="text-xs font-semibold">
                          {language === 'tr' ? opt.nameTr : opt.nameEn}
                        </span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Step */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 animate-in fade-in">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'tr' ? currentQ.explanationTr : currentQ.explanationEn}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => inspectElementIn3D(currentQ.correctSymbol)}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {language === 'tr'
                          ? `${currentQ.correctSymbol} Elementini 3B Tabloda İncele`
                          : `Inspect ${currentQ.correctSymbol} in 3D`}
                      </span>
                    </button>

                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      <span>{language === 'tr' ? 'Sonraki Soru' : 'Next'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Results Screen
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {language === 'tr' ? 'Tebrikler! Quiz Tamamlandı' : 'Congratulations! Quiz Complete'}
                </h3>
                <p className="text-xs text-slate-400">
                  {score >= 600
                    ? language === 'tr' ? '🏆 Ünvan: Nobel Kimyageri' : '🏆 Title: Nobel Laureate'
                    : score >= 300
                    ? language === 'tr' ? '🔬 Ünvan: Kuantum Araştırmacısı' : '🔬 Title: Quantum Researcher'
                    : language === 'tr' ? '🧪 Ünvan: Çaylak Simyacı' : '🧪 Title: Novice Alchemist'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block font-mono">
                <span className="text-2xl font-black text-amber-400">{score}</span>
                <span className="text-xs text-slate-500 block">
                  {language === 'tr' ? 'Toplam Puan' : 'Total Score'}
                </span>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={restartQuiz}
                  className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'tr' ? 'Yeniden Başla' : 'Play Again'}</span>
                </button>
                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                >
                  {language === 'tr' ? 'Kapat' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
