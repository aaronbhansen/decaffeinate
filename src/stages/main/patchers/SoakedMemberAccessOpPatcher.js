import MemberAccessOpPatcher from './MemberAccessOpPatcher.js';
import findSoakContainer from '../../../utils/findSoakContainer.js';

const GUARD_HELPER =
  `function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}`;

export default class SoakedMemberAccessOpPatcher extends MemberAccessOpPatcher {
  patchAsExpression() {
    this.registerHelper('__guard__', GUARD_HELPER);
    let memberNameToken = this.getMemberNameSourceToken();
    let soakContainer = findSoakContainer(this);
    let varName = soakContainer.claimFreeBinding('x');
    this.overwrite(this.expression.outerEnd, memberNameToken.start, `, ${varName} => ${varName}.`);
    soakContainer.insert(soakContainer.contentStart, '__guard__(');
    soakContainer.insert(soakContainer.contentEnd, ')');

    this.expression.patch();
  }
}
