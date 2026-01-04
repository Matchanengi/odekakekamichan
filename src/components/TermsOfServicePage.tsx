export function TermsOfServicePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">利用規約</h2>
        
        <div className="border-2 border-black rounded-lg p-6 bg-white h-[400px] sm:h-[500px] overflow-y-auto mb-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">【株式会社まっちゃんエンジニアリング利用規約】</h3>
              <p className="leading-relaxed">
                本規約は、株式会社まっちゃんエンジニアリングが提供する「おでかけかみちゃん」のサービスをご利用いただく際の取り扱いについて定めたものです。「おでかけかみちゃん」を会員登録をされている場合は、本規約の内容に同意した上で、会員登録を行ってください。また、ご登録前に「おでかけかみちゃん」をご利用いただく場合には、実際にご利用されたことをもって本規約にご同意いただいたものとみなします。ご利用の際は、本規約にご同意いただいたことによりお客様と当社との間で成立するサービス利用規約を（本契約」といいます。）
              </p>
            </div>

            <div>
              <h3 className="mb-2">第1条(おでかけかみちゃんについて)</h3>
              <p className="leading-relaxed">
                「おでかけかみちゃん」は、高知県香美市が運営するデマンド型交通システムの予約管理サービスです。本サービスを通じて、利用者は便利に予約を行うことができます。
              </p>
            </div>

            <div>
              <h3 className="mb-2">第2条(利用者の義務)</h3>
              <p className="leading-relaxed">
                利用者は、本サービスを利用するにあたり、正確な情報を提供し、不正な利用を行わないことに同意します。また、予約のキャンセルは所定の手続きに従って行うものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2">第3条(個人情報の取り扱い)</h3>
              <p className="leading-relaxed">
                当社は、利用者の個人情報を適切に管理し、本サービスの提供以外の目的で使用することはありません���詳細は、別途定めるプライバシーポリシーをご確認ください。
              </p>
            </div>

            <div>
              <h3 className="mb-2">第4条(免責事項)</h3>
              <p className="leading-relaxed">
                当社は、本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負わないものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2">第5条(規約の変更)</h3>
              <p className="leading-relaxed">
                当社は、必要に応じて本規約を変更することができるものとします。変更後の規約は、本サービス上で公表した時点より効力を生じるものとします。
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-12 sm:px-16 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}