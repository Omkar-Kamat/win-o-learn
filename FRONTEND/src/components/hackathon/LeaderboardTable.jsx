import { TrophyIcon } from '@heroicons/react/24/solid';

export default function LeaderboardTable({ results = [] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-muted/50 border-b border-border">
        <tr>
          <th className="px-6 py-4 font-semibold text-foreground w-20">Rank</th>
          <th className="px-6 py-4 font-semibold text-foreground">Team</th>
          <th className="px-6 py-4 font-semibold text-foreground">Project</th>
          <th className="px-6 py-4 font-semibold text-foreground text-right">Score</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          let trophyColor = '';
          if (rank === 1) trophyColor = 'text-yellow-400';
          else if (rank === 2) trophyColor = 'text-gray-400';
          else if (rank === 3) trophyColor = 'text-amber-600';

          return (
            <tr key={result.rank} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
              <td className="px-6 py-4 font-medium flex items-center gap-2">
                {isTop3 ? (
                  <TrophyIcon className={`w-5 h-5 ${trophyColor}`} />
                ) : (
                  <span className="w-5 text-center text-muted-foreground">#{rank}</span>
                )}
              </td>
              <td className="px-6 py-4 text-foreground">{result.teamName}</td>
              <td className="px-6 py-4 text-primary hover:underline cursor-pointer font-medium">{result.projectName}</td>
              <td className="px-6 py-4 text-right font-bold text-2xl font-semibold tracking-tight text-foreground">{result.totalScore}</td>
            </tr>
          );
        })}
        {results.length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
              Results have not been published yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
