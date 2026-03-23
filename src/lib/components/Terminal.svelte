<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fetchRepos, getStars } from '$lib/github';

	let history = $state<Array<{ type: 'input' | 'output'; text: string }>>([]);
	let currentInput = $state('');
	let inputEl: HTMLInputElement;
	let scrollEl: HTMLDivElement;

	const prompt = 'osman@osmancoskun:~$';

	const neofetch = `\x1b[cyan]       osman@osmancoskun\x1b[reset]
       ─────────────────
\x1b[cyan]  ●    \x1b[reset]OS: Pardus/Debian GNU/Linux 13
\x1b[cyan] ● ●   \x1b[reset]Host: osmancoskun.com
\x1b[cyan]● ● ●  \x1b[reset]Kernel: 6.12.0-portfolio
\x1b[cyan] ● ●   \x1b[reset]Uptime: since April 23, 1995
\x1b[cyan]  ●    \x1b[reset]Shell: bash 5.2
       WM: sway
\x1b[yellow]       \x1b[reset]Role: Software Engineer @ TUBITAK
\x1b[green]       \x1b[reset]Focus: Pardus / GNOME / Desktop Apps
\x1b[cyan]       \x1b[reset]Edu: Firat University — Software Eng.
\x1b[cyan]       \x1b[reset]Loc: Ankara, Turkey
\x1b[cyan]       \x1b[reset]Origin: Famagusta, Northern Cyprus

\x1b[cyan]       \x1b[reset]Languages: Python, JavaScript, TypeScript,
                  Shell Script, GJS
\x1b[cyan]       \x1b[reset]Backend: Flask, FastAPI, Node.js, Express
\x1b[cyan]       \x1b[reset]Frontend: Svelte/SvelteKit, Vue, Three.js
\x1b[cyan]       \x1b[reset]Desktop: GTK3/GTK4, GJS, GNOME Extensions
\x1b[cyan]       \x1b[reset]DB: PostgreSQL, MySQL, SQLite, Firebase
\x1b[cyan]       \x1b[reset]Tools: Git, Docker, Linux, Neovim

       \x1b[red]●\x1b[yellow]●\x1b[green]●\x1b[cyan]●\x1b[accent]●\x1b[magenta]●\x1b[reset]`;

	const files: Record<string, string | (() => string)> = {
		'about.txt': `Hi, I'm Osman Coskun.

Originally from Famagusta, Northern Cyprus.
Currently based in Ankara, Turkey.

Software engineer with 3+ years of experience across
fullstack web development and Linux desktop applications.

Currently at TUBITAK, building applications for the
Pardus GNU/Linux operating system and developing
extensions for the GNOME desktop environment.

Previously worked on tourism platforms, currency exchange
systems, and various web automation solutions as a
fullstack developer.

I daily drive Sway because tiling window managers
are the way.`,

		'experience.txt': `=== TUBITAK — Software Engineer (02/2023 - Present) ===
  - Application development for GNU/Linux Pardus
  - GNOME desktop environment extensions
  - Backend and frontend web development
  - 3D model projects with Three.js
  - Stack: Python, GTK3/GTK4, Shell, GJS, Web, Three.js

=== Freelance — Fullstack Developer (2021 - Present) ===
  - Currency exchange platform: sales tracking, daily rates
  - Automotive gallery: inventory, tax, online payments
  - Holding company: multi-business tracking, analytics

=== Arniva — Fullstack Developer (12/2021 - 09/2022) ===
  - Tourism platform with multi-role architecture
  - Real-time features with WebSocket
  - Stack: Node.js, Express, MySQL, SocketIO, Svelte`,

		'projects/': `drwxr-xr-x  gnome-extensions/
drwxr-xr-x  pardus-apps/
drwxr-xr-x  web-projects/
drwxr-xr-x  freelance/
-rw-r--r--  README.md

Try: cat projects/pardus-gnome-greeter
     cat projects/pardus-nvidia-installer
     cat projects/pardus-gnome-shortcuts`,

		'projects/pardus-gnome-greeter': () => `pardus-gnome-greeter
━━━━━━━━━━━━━━━━━━━━
A login/greeter screen for GNOME on Pardus.
Built with Python and GTK, handles user authentication
and session selection for the Pardus desktop.

Language:  Python (GTK)
Stars:     ${getStars('pardus-gnome-greeter')}
Repo:      github.com/pardus/pardus-gnome-greeter`,

		'projects/pardus-nvidia-installer': () => `pardus-nvidia-installer
━━━━━━━━━━━━━━━━━━━━━━
NVIDIA driver installer for Pardus GNU/Linux.
Simplifies the painful process of getting NVIDIA
drivers working on Debian-based systems.

Language:  Python
Stars:     ${getStars('pardus-nvidia-installer')}
Repo:      github.com/pardus/pardus-nvidia-installer`,

		'projects/pardus-gnome-shortcuts': () => `pardus-gnome-shortcuts
━━━━━━━━━━━━━━━━━━━━━━
GNOME keyboard shortcut manager for Pardus.
A GUI tool to view, edit, and manage keyboard
shortcuts in the GNOME desktop environment.

Language:  Python (GTK)
Stars:     ${getStars('pardus-gnome-shortcuts')}
Repo:      github.com/pardus/pardus-gnome-shortcuts`,

		'skills.txt': `Languages:  Python, JavaScript, TypeScript, Shell Script, GJS
Backend:    Flask, FastAPI, Quart, Node.js, Express
Frontend:   Svelte/SvelteKit, Vue, Framework7, Three.js
Desktop:    GTK3/GTK4, GJS, GNOME Shell Extensions
Databases:  PostgreSQL, MySQL, SQLite, Firebase
Tools:      Git, Docker, Linux, Neovim
Languages:  Turkish [Native], English [Intermediate]`,

		'contact.txt': `Email:    osman.coskun95@gmail.com
GitHub:   github.com/osmancoskun
LinkedIn: linkedin.com/in/osmancoskun95
Web:      osmancoskun.com`,
	};

	function getFile(name: string): string | undefined {
		const f = files[name];
		if (f === undefined) return undefined;
		return typeof f === 'function' ? f() : f;
	}

	function parseAnsi(text: string): string {
		return text
			.replace(/\x1b\[cyan\]/g, '<span class="text-[var(--color-cyan)]">')
			.replace(/\x1b\[green\]/g, '<span class="text-[var(--color-green)]">')
			.replace(/\x1b\[yellow\]/g, '<span class="text-[var(--color-yellow)]">')
			.replace(/\x1b\[red\]/g, '<span class="text-[var(--color-red)]">')
			.replace(/\x1b\[magenta\]/g, '<span class="text-[var(--color-magenta)]">')
			.replace(/\x1b\[accent\]/g, '<span class="text-[var(--color-accent)]">')
			.replace(/\x1b\[reset\]/g, '</span>');
	}

	function processCommand(cmd: string): string {
		const trimmed = cmd.trim();
		const parts = trimmed.split(/\s+/);
		const command = parts[0];
		const args = parts.slice(1);

		switch (command) {
			case '':
				return '';
			case 'neofetch':
				return neofetch;
			case 'whoami':
				return 'osman';
			case 'hostname':
				return 'osmancoskun';
			case 'pwd':
				return '/home/osman';
			case 'date':
				return new Date().toString();
			case 'uname':
				if (args.includes('-a'))
					return 'Linux osmancoskun 6.12.0-portfolio #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
				if (args.includes('-r'))
					return '6.12.0-portfolio';
				return 'Linux';
			case 'uptime': {
				const birth = new Date(1995, 3, 23);
				const now = new Date();
				const diff = now.getTime() - birth.getTime();
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const years = Math.floor(days / 365);
				const remaining = days % 365;
				return ` ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} up ${years} years, ${remaining} days, 1 user, load average: 0.42, 0.69, 0.13`;
			}
			case 'ls':
				if (args.includes('-la') || args.includes('-l') || args.includes('-al')) {
					return `total 42
drwxr-xr-x  2 osman osman 4096 Mar 23 09:42 .
drwxr-xr-x  3 root  root  4096 Mar 23 09:42 ..
-rw-r--r--  1 osman osman  420 Mar 23 09:42 .bashrc
-rw-r--r--  1 osman osman  220 Mar 23 09:42 .profile
-rw-r--r--  1 osman osman  512 Mar 23 09:42 about.txt
-rw-r--r--  1 osman osman  256 Mar 23 09:42 contact.txt
-rw-r--r--  1 osman osman 1024 Mar 23 09:42 experience.txt
drwxr-xr-x  4 osman osman 4096 Mar 23 09:42 projects/
-rw-r--r--  1 osman osman  384 Mar 23 09:42 skills.txt`;
				}
				if (args.includes('-a')) {
					return '.  ..  .bashrc  .profile  about.txt  contact.txt  experience.txt  projects/  skills.txt';
				}
				return 'about.txt  contact.txt  experience.txt  projects/  skills.txt';
			case 'cat':
				if (args.length === 0) return 'cat: missing operand';
				if (getFile(args[0])) return getFile(args[0])!;
				return `cat: ${args[0]}: No such file or directory`;
			case 'echo':
				return args.join(' ');
			case 'id':
				return 'uid=1000(osman) gid=1000(osman) groups=1000(osman),27(sudo),100(users)';
			case 'which':
				if (args.length === 0) return '';
				return `/usr/bin/${args[0]}`;
			case 'env':
				return `USER=osman
HOME=/home/osman
SHELL=/bin/bash
TERM=foot
EDITOR=nvim
LANG=en_US.UTF-8
XDG_SESSION_TYPE=wayland
WAYLAND_DISPLAY=wayland-1
SWAYSOCK=/run/user/1000/sway-ipc.sock`;
			case 'history':
				return history
					.filter((e) => e.type === 'input')
					.map((e, i) => `  ${i + 1}  ${e.text}`)
					.join('\n') || '  1  history';
			case 'head':
				if (args.length === 0) return 'head: missing operand';
				if (getFile(args[0])) return getFile(args[0])!.split('\n').slice(0, 10).join('\n');
				return `head: ${args[0]}: No such file or directory`;
			case 'wc':
				if (args.length === 0) return 'wc: missing operand';
				if (getFile(args[0])) {
					const content = getFile(args[0])!;
					const lines = content.split('\n').length;
					const words = content.split(/\s+/).length;
					const chars = content.length;
					return `  ${lines}  ${words} ${chars} ${args[0]}`;
				}
				return `wc: ${args[0]}: No such file or directory`;
			case 'file':
				if (args.length === 0) return 'file: missing operand';
				if (getFile(args[0])) return `${args[0]}: UTF-8 Unicode text`;
				return `${args[0]}: cannot open`;
			case 'tree':
				return `.
├── about.txt
├── contact.txt
├── experience.txt
├── projects/
│   ├── gnome-extensions/
│   ├── pardus-apps/
│   ├── web-projects/
│   ├── freelance/
│   └── README.md
└── skills.txt

5 directories, 4 files`;
			case 'help':
				return `Available commands:
  neofetch    - display system info
  whoami      - current user
  ls [-la]    - list files
  cat <file>  - read a file
  head <file> - first 10 lines of a file
  tree        - show directory tree
  wc <file>   - word count
  file <file> - file type info
  echo <text> - print text
  pwd         - print working directory
  date        - show current date
  uname [-a]  - system information
  uptime      - how long since boot
  hostname    - show hostname
  id          - user identity
  env         - environment variables
  which <cmd> - locate a command
  history     - command history
  clear       - clear terminal
  help        - show this help`;
			case 'clear':
				history = [];
				return '';
			case 'cd':
				return `bash: cd: nowhere to go, you're already home`;
			case 'rm':
				return `rm: nice try`;
			case 'sudo':
				return `osman is not in the sudoers file. This incident will be reported.`;
			case 'exit':
				return `You can check out any time you like, but you can never leave.`;
			case 'vim':
			case 'nvim':
				return `error: this is a portfolio, not a text editor. but good taste.`;
			case 'htop':
			case 'top':
				return `error: too many processes to render. just trust me, everything's fine.`;
			case 'apt':
			case 'apt-get':
				return `E: Could not open lock file - are you even root?`;
			case 'ping': {
				if (args.length === 0) return 'usage: ping <host>';
				const host = args[0];
				if (host.includes('osmancoskun'))
					return `PING ${host}: 64 bytes — yeah, you're already here. it works.`;
				return `ping: ${host}: Temporary failure in name resolution
...look, we're running in a browser. ICMP packets aren't really our thing.
but hey, osmancoskun.com is doing great if you're seeing this!`;
			}
			case 'curl': {
				const url = args[0];
				if (!url) return 'curl: try \'curl --help\' for more information';
				if (url.includes('osmancoskun'))
					return `{"status":"alive","coffee_level":"critical","bugs_fixed_today":42}`;
				return `curl: (6) Could not resolve host: ${url}\njust kidding, this is a fake terminal.`;
			}
			case 'ssh':
				return args.length === 0
					? 'usage: ssh hostname'
					: `ssh: connect to host ${args[0]} port 22: Connection refused\n(this is a portfolio, not a server)`;
			case 'wget':
				return args.length === 0
					? 'wget: missing URL'
					: `--  ${new Date().toLocaleTimeString('en-GB')}  ${args[0]}\nResolving... failed: NXDOMAIN.\nThis terminal doesn't have internet. Shocking, I know.`;
			case 'git':
				if (args[0] === 'log')
					return `commit a1b2c3d (HEAD -> main)
Author: Osman Coskun <osman.coskun95@gmail.com>
Date:   ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}

    made it look like it works`;
				if (args[0] === 'status')
					return `On branch main\nnothing to commit, working tree clean`;
				if (args[0] === 'blame')
					return `It was me. It's always me.`;
				if (args[0] === 'push')
					return `Everything up-to-date (or is it?)`;
				return `usage: git <command>`;
			case 'man':
				if (args.length === 0) return `What manual page do you want?\nJust kidding, type 'help'.`;
				return `No manual entry for ${args[0]}\nThis is a portfolio. Type 'help'.`;
			case 'grep':
				if (args.length < 2) return 'usage: grep <pattern> <file>';
				if (getFile(args[1])) {
					const matches = getFile(args[1])!.split('\n').filter(l => l.toLowerCase().includes(args[0].toLowerCase()));
					return matches.length > 0 ? matches.join('\n') : `(no matches)`;
				}
				return `grep: ${args[1]}: No such file or directory`;
			case 'cowsay': {
				const msg = args.length > 0 ? args.join(' ') : "moo, I'm a portfolio";
				const border = '_'.repeat(msg.length + 2);
				const borderB = '-'.repeat(msg.length + 2);
				return ` ${border}
< ${msg} >
 ${borderB}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
			}
			default:
				return `bash: ${command}: command not found. Type 'help' for available commands.`;
		}
	}

	async function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const cmd = currentInput;
			history.push({ type: 'input', text: cmd });

			const output = processCommand(cmd);
			if (output) {
				history.push({ type: 'output', text: output });
			}

			currentInput = '';
			await tick();
			scrollEl?.scrollTo(0, scrollEl.scrollHeight);
		}
	}

	function focusInput() {
		inputEl?.focus();
	}

	onMount(() => {
		fetchRepos();
		history.push({ type: 'output', text: neofetch });
		focusInput();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="h-full bg-[var(--color-bg)] p-3 font-mono text-sm text-[var(--color-fg)] overflow-auto"
	bind:this={scrollEl}
	onclick={focusInput}
>
	{#each history as entry}
		{#if entry.type === 'input'}
			<div class="flex gap-2">
				<span class="text-[var(--color-green)] shrink-0">{prompt}</span>
				<span>{entry.text}</span>
			</div>
		{:else}
			<pre class="whitespace-pre-wrap mb-1">{@html parseAnsi(entry.text)}</pre>
		{/if}
	{/each}

	<!-- Current input line -->
	<div class="flex gap-2">
		<span class="text-[var(--color-green)] shrink-0">{prompt}</span>
		<input
			bind:this={inputEl}
			bind:value={currentInput}
			onkeydown={handleKeydown}
			class="flex-1 bg-transparent outline-none caret-[var(--color-accent)] text-[var(--color-fg)]"
			spellcheck="false"
			autocomplete="off"
		/>
	</div>
</div>
