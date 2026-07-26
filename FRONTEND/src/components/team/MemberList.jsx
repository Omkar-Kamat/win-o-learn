export default function MemberList({ members, isLeader, onMakeLeader, onRemove }) {
  return (
    <ul className="space-y-4">
      {members.map(member => (
        <li key={member._id} className="flex items-center justify-between p-4 bg-surface rounded-[10px] border border-base">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary-text-on font-bold">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-body flex items-center gap-2">
                {member.name}
                {member.role === 'leader' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Leader</span>
                )}
              </div>
              <div className="text-sm text-muted">{member.email}</div>
            </div>
          </div>
          
          {isLeader && member.role !== 'leader' && (
            <div className="flex items-center gap-3">
              <button onClick={() => onMakeLeader && onMakeLeader(member._id)} className="text-sm text-primary hover:underline font-medium">Make Leader</button>
              <button onClick={() => onRemove && onRemove(member._id)} className="text-sm text-error hover:underline font-medium">Remove</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
