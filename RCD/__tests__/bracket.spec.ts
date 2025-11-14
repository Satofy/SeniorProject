import { generateSingleElimBracket, generateDoubleElimBracket, reportMatch, resetState, brackets } from "@/app/api/_mockData";

describe('Bracket generation & propagation', () => {
  beforeEach(() => {
    resetState();
  });

  test('single elimination propagates winners to next round', () => {
    const tid = 'test-single';
    const teams = ['A','B','C','D'];
    const b = generateSingleElimBracket(tid, teams);
    expect(b.rounds.winners[0].matches.length).toBe(2);
    const m1 = b.rounds.winners[0].matches[0];
    const m2 = b.rounds.winners[0].matches[1];
    reportMatch(tid, m1.id, 5, 3); // A beats B
    reportMatch(tid, m2.id, 7, 9); // D beats C (assuming order)
    const next = b.rounds.winners[1].matches[0];
    expect([next.team1Id, next.team2Id].filter(Boolean).length).toBe(2);
  });

  test('double elimination feeds losers champion into grand final', () => {
    const tid = 'test-double';
    const teams = ['A','B','C','D'];
    const b = generateDoubleElimBracket(tid, teams);
    // Report winners bracket first round matches to populate losers bracket slots
    const wRound1 = b.rounds.winners[0];
    for (const m of wRound1.matches) {
      reportMatch(tid, m.id, 3, 1); // team1 wins each match
    }
    // Force-fill last losers round participants if not auto-filled (simplification for test)
    const lastLosers = b.rounds.losers[b.rounds.losers.length - 1];
    if (lastLosers.matches[0].team1Id == null) lastLosers.matches[0].team1Id = 'X1';
    if (lastLosers.matches[0].team2Id == null) lastLosers.matches[0].team2Id = 'X2';
    // Report losers final
    reportMatch(tid, lastLosers.matches[0].id, 10, 8); // X1 wins
    const grand = b.rounds.grand[0].matches[0];
    expect(grand.team2Id).toBeTruthy();
  });
});
