"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
const markdown_preview_view_1 = require("./markdown-preview-view");
const util_1 = require("../util");
const ipc_1 = require("./ipc");
const electron_1 = require("electron");
class MarkdownPreviewViewEditorRemote extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(windowId, editorId) {
        super();
        this.windowId = windowId;
        this.editorId = editorId;
        this.text = '';
        this.title = '<Pending>';
        this.ipc = new ipc_1.IPCCaller(windowId, editorId);
        this.disposables.add(this.ipc);
        this.handleEditorEvents();
        this.ipc
            .init()
            .then((v) => {
            this.text = v.text;
            this.path = v.path;
            this.grammar = atom.grammars.grammarForScopeName(v.grammar);
            this.title = v.title;
            this.emitter.emit('did-change-title');
            this.changeHandler();
        })
            .catch((e) => {
            atom.notifications.addError('Failed to open preview', {
                dismissable: true,
                detail: e.toString(),
                stack: e.stack,
            });
        });
    }
    static open(editor) {
        const windowId = electron_1.remote.getCurrentWindow().id;
        const editorId = editor.id;
        atom.open({
            pathsToOpen: [
                `markdown-preview-plus://remote-editor/${windowId}/${editorId}`,
            ],
            newWindow: true,
        });
        ipc_1.RemoteEditorServer.create(editor);
    }
    destroy() {
        this.ipc.destroy().catch(ignore);
        super.destroy();
    }
    getTitle() {
        return `${this.title} Preview`;
    }
    getURI() {
        return `markdown-preview-plus://remote-editor/${this.windowId}/${this.editorId}`;
    }
    getPath() {
        return this.path;
    }
    serialize() {
        return undefined;
    }
    openNewWindow() {
        atom.open({
            pathsToOpen: [this.getURI()],
            newWindow: true,
        });
        util.destroy(this);
    }
    async getMarkdownSource() {
        return this.text;
    }
    getGrammar() {
        return this.grammar;
    }
    didScrollPreview(min, max) {
        if (!ipc_1.shouldScrollSync('preview'))
            return;
        this.ipc.scrollToBufferRange([min, max]).catch(ignore);
    }
    openSource(initialLine) {
        this.ipc.openSource(initialLine).catch((e) => {
            console.log(e);
            const path = this.getPath();
            if (path) {
                util_1.handlePromise(atom.workspace.open(path, {
                    initialLine,
                }));
            }
            else {
                atom.notifications.addWarning('Failed to sync source: no editor and no path');
            }
        });
    }
    handleEditorEvents() {
        this.disposables.add(new ipc_1.EventHandler(this.windowId, this.editorId, {
            changeText: (text) => {
                this.text = text;
                this.changeHandler();
            },
            syncPreview: ({ pos, flash }) => {
                this.syncPreview(pos, flash);
            },
            changePath: ({ title, path }) => {
                this.title = title;
                this.path = path;
                this.emitter.emit('did-change-title');
            },
            changeGrammar: (grammarName) => {
                this.grammar = atom.grammars.grammarForScopeName(grammarName);
                this.emitter.emit('did-change-title');
            },
            destroy: () => {
                util.destroy(this);
            },
            scrollSync: ([firstLine, lastLine]) => {
                this.handler.scrollSync(firstLine, lastLine);
            },
        }));
    }
}
exports.MarkdownPreviewViewEditorRemote = MarkdownPreviewViewEditorRemote;
function ignore() {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQThCO0FBQzlCLG1FQUE0RTtBQUM1RSxrQ0FBdUM7QUFDdkMsK0JBS2M7QUFDZCx1Q0FBaUM7QUFFakMsTUFBYSwrQkFBZ0MsU0FBUSwyQ0FBbUI7SUFPdEUsWUFBb0IsUUFBZ0IsRUFBVSxRQUFnQjtRQUM1RCxLQUFLLEVBQUUsQ0FBQTtRQURXLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTnRELFNBQUksR0FBRyxFQUFFLENBQUE7UUFDVCxVQUFLLEdBQVcsV0FBVyxDQUFBO1FBT2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsR0FBRzthQUNMLElBQUksRUFBRTthQUNOLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFBO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQTtZQUNwQixJQUFJLENBQUMsT0FB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QUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUM5QyxDQUFDO1NBQ0YsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDO0NBQ0Y7QUFySUQsMEVBcUlDO0FBRUQsU0FBUyxNQUFNO0FBRWYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRleHRFZGl0b3IsIEdyYW1tYXIgfSBmcm9tICdhdG9tJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3LCBTZXJpYWxpemVkTVBWIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7XG4gIEV2ZW50SGFuZGxlcixcbiAgSVBDQ2FsbGVyLFxuICBzaG91bGRTY3JvbGxTeW5jLFxuICBSZW1vdGVFZGl0b3JTZXJ2ZXIsXG59IGZyb20gJy4vaXBjJ1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgdGV4dCA9ICcnXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyA9ICc8UGVuZGluZz4nXG4gIHByaXZhdGUgcGF0aD86IHN0cmluZ1xuICBwcml2YXRlIGdyYW1tYXI/OiBHcmFtbWFyXG4gIHByaXZhdGUgaXBjOiBJUENDYWxsZXJcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHdpbmRvd0lkOiBudW1iZXIsIHByaXZhdGUgZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmlwYyA9IG5ldyBJUENDYWxsZXIod2luZG93SWQsIGVkaXRvcklkKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuaXBjKVxuICAgIHRoaXMuaGFuZGxlRWRpdG9yRXZlbnRzKClcbiAgICB0aGlzLmlwY1xuICAgICAgLmluaXQoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdi50ZXh0XG4gICAgICAgIHRoaXMucGF0aCA9IHYucGF0aFxuICAgICAgICB0aGlzLmdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUodi5ncmFtbWFyKVxuICAgICAgICB0aGlzLnRpdGxlID0gdi50aXRsZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlOiBFcnJvcikgPT4ge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBvcGVuIHByZXZpZXcnLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgZGV0YWlsOiBlLnRvU3RyaW5nKCksXG4gICAgICAgICAgc3RhY2s6IGUuc3RhY2ssXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBvcGVuKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIGNvbnN0IHdpbmRvd0lkID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuICAgIGNvbnN0IGVkaXRvcklkID0gZWRpdG9yLmlkXG4gICAgYXRvbS5vcGVuKHtcbiAgICAgIHBhdGhzVG9PcGVuOiBbXG4gICAgICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9yZW1vdGUtZWRpdG9yLyR7d2luZG93SWR9LyR7ZWRpdG9ySWR9YCxcbiAgICAgIF0sXG4gICAgICBuZXdXaW5kb3c6IHRydWUsXG4gICAgfSlcbiAgICBSZW1vdGVFZGl0b3JTZXJ2ZXIuY3JlYXRlKGVkaXRvcilcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIHRoaXMuaXBjLmRlc3Ryb3koKS5jYXRjaChpZ25vcmUpXG4gICAgc3VwZXIuZGVzdHJveSgpXG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMudGl0bGV9IFByZXZpZXdgXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vcmVtb3RlLWVkaXRvci8ke3RoaXMud2luZG93SWR9LyR7XG4gICAgICB0aGlzLmVkaXRvcklkXG4gICAgfWBcbiAgfVxuXG4gIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgIHJldHVybiB0aGlzLnBhdGhcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnlcbiAgfVxuXG4gIHByb3RlY3RlZCBvcGVuTmV3V2luZG93KCkge1xuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogW3RoaXMuZ2V0VVJJKCldLFxuICAgICAgbmV3V2luZG93OiB0cnVlLFxuICAgIH0pXG4gICAgdXRpbC5kZXN0cm95KHRoaXMpXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dFxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZ3JhbW1hclxuICB9XG5cbiAgcHJvdGVjdGVkIGRpZFNjcm9sbFByZXZpZXcobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgaWYgKCFzaG91bGRTY3JvbGxTeW5jKCdwcmV2aWV3JykpIHJldHVyblxuICAgIHRoaXMuaXBjLnNjcm9sbFRvQnVmZmVyUmFuZ2UoW21pbiwgbWF4XSkuY2F0Y2goaWdub3JlKVxuICB9XG5cbiAgcHJvdGVjdGVkIG9wZW5Tb3VyY2UoaW5pdGlhbExpbmU/OiBudW1iZXIpIHtcbiAgICB0aGlzLmlwYy5vcGVuU291cmNlKGluaXRpYWxMaW5lKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lLFxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAnRmFpbGVkIHRvIHN5bmMgc291cmNlOiBubyBlZGl0b3IgYW5kIG5vIHBhdGgnLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRWRpdG9yRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IEV2ZW50SGFuZGxlcih0aGlzLndpbmRvd0lkLCB0aGlzLmVkaXRvcklkLCB7XG4gICAgICAgIGNoYW5nZVRleHQ6ICh0ZXh0KSA9PiB7XG4gICAgICAgICAgdGhpcy50ZXh0ID0gdGV4dFxuICAgICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHN5bmNQcmV2aWV3OiAoeyBwb3MsIGZsYXNoIH0pID0+IHtcbiAgICAgICAgICB0aGlzLnN5bmNQcmV2aWV3KHBvcywgZmxhc2gpXG4gICAgICAgIH0sXG4gICAgICAgIGNoYW5nZVBhdGg6ICh7IHRpdGxlLCBwYXRoIH0pID0+IHtcbiAgICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcbiAgICAgICAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9LFxuICAgICAgICBjaGFuZ2VHcmFtbWFyOiAoZ3JhbW1hck5hbWUpID0+IHtcbiAgICAgICAgICB0aGlzLmdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoZ3JhbW1hck5hbWUpIVxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogKCkgPT4ge1xuICAgICAgICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICAgICAgICB9LFxuICAgICAgICBzY3JvbGxTeW5jOiAoW2ZpcnN0TGluZSwgbGFzdExpbmVdKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVyLnNjcm9sbFN5bmMoZmlyc3RMaW5lLCBsYXN0TGluZSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBpZ25vcmUoKSB7XG4gIC8qIGRvIG5vdGlobmcgKi9cbn1cbiJdfQ==