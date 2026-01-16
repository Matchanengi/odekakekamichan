// src/components/TermsOfServicePage.tsx

export function TermsOfServicePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600 font-bold">利用規約</h2>
        
        <div className="border-2 border-black rounded-lg p-6 bg-white h-[400px] sm:h-[500px] overflow-y-auto mb-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 font-bold text-gray-800">【株式会社まっちゃんエンジニアリング利用規約】</h3>
              <p className="leading-relaxed text-gray-700">
                本規約は、株式会社まっちゃんエンジニアリングが提供する「おでかけかみちゃん」のサービスをご利用いただく際の取り扱いについて定めたものです。
                「おでかけかみちゃん」を会員登録をされている場合は、本規約の内容に同意した上で、会員登録を行ってください。
                また、ご登録前に「おでかけかみちゃん」をご利用いただく場合には、実際にご利用されたことをもって本規約にご同意いただいたものとみなします。
                ご利用の際は、本規約にご同意いただいたことによりお客様と当社との間で成立するサービス利用規約を「本契約」といいます。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第1条(適用)</h3>
              <p className="leading-relaxed text-gray-700">
                本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第2条(おでかけかみちゃんについて)</h3>
              {/* ★ <p> を <div> に変更 */}
              <div className="leading-relaxed text-gray-700">
                <ol className="list-decimal ml-6 mt-2 space-y-2">
                  <li>「おでかけかみちゃん」は、高知県香美市が運営するデマンド型交通システムの予約管理サービスです。(以下、「本サービス」といいます。)本サービスを通じて、利用者は便利に予約を行うことができます。</li>
                  <li>本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。</li>
                  <li>当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
                    {/* ★ ネストしたリストは li の中に入れるのが正しい構造です */}
                    <ol className="list-[circle] ml-6 mt-2 space-y-1">
                      <li>利用登録の申請に際して虚偽 of 事項を届け出た場合</li>
                      <li>本規約に違反したことがある者からの申請である場合</li>
                      <li>その他，当社が利用登録を相当でないと判断した場合</li>
                    </ol>
                  </li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第3条(利用者の義務)</h3>
              <p className="leading-relaxed text-gray-700">
                利用者は、本サービスを利用するにあたり、正確な情報を提供し、不正な利用を行わないことに同意します。また、予約のキャンセルは所定の手続きに従って行うものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第4条(個人情報の取り扱い)</h3>
              <p className="leading-relaxed text-gray-700">
                当社は、利用者の個人情報を適切に管理し、本サービスの提供以外の目的で使用することはありません。詳細は、別途定めるプライバシーポリシーをご確認ください。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第5条(免責事項)</h3>
              <p className="leading-relaxed text-gray-700">
                当社は、本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負わないものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第6条(規約の変更)</h3>
              <p className="leading-relaxed text-gray-700">
                当社は、必要に応じて本規約を変更することができるものとします。変更後の規約は、本サービス上で公表した時点より効力を生じるものとします。
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-800">第7条(禁止事項)</h3>
              {/* ★ <p> を <div> に変更 */}
              <div className="leading-relaxed text-gray-700">
                <ol className="list-decimal ml-6 mt-2 space-y-1">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
                  <li>当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
                  <li>本サービスによって得られた情報を商業的に利用する行為</li>
                  <li>当社のサービスの運営を妨害するおそれのある行為</li>
                  <li>不正アクセスをし，またはこれを試みる行為</li>
                  <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                  <li>不正な目的を持って本サービスを利用する行為</li>
                  <li>本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為</li>
                  <li>他のユーザーに成りすます行為</li>
                  <li>当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為</li>
                  <li>面識のない異性との出会いを目的とした行為</li>
                  <li>当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為</li>
                  <li>その他，当社が不適切と判断する行為</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-12 sm:px-16 py-3 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-md active:scale-95"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}