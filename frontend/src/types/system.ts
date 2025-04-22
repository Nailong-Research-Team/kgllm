export interface SystemStats {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: {
        bytes_sent: number;
        bytes_recv: number;
    };
}

export type ThemeMode = 'light' | 'dark';
// export type Language = 'zh' | 'en'; 