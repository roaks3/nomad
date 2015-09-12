package command

import (
	"strings"
	"testing"

	"github.com/hashicorp/nomad/api"
	"github.com/mitchellh/cli"
)

func TestStatusCommand_Implements(t *testing.T) {
	var _ cli.Command = &StatusCommand{}
}

func TestStatusCommand_Run(t *testing.T) {
	srv, client, url := testServer(t)
	defer srv.Stop()

	ui := new(cli.MockUi)
	cmd := &StatusCommand{Ui: ui}

	// Should return blank for no jobs
	if code := cmd.Run([]string{"-http-addr=" + url}); code != 0 {
		t.Fatalf("expected exit 0, got: %d", code)
	}

	// Check for this awkward nil string, since a nil bytes.Buffer
	// returns this purposely, and mitchellh/cli has a nil pointer
	// if nothing was ever output.
	if out := ui.OutputWriter.String(); out != "<nil>" {
		t.Fatalf("expected empty output, got: %s", out)
	}

	// Register two jobs
	job1 := api.NewBatchJob("job1", "myjob", 1)
	if _, _, err := client.Jobs().Register(job1, nil); err != nil {
		t.Fatalf("err: %s", err)
	}
	job2 := api.NewBatchJob("job2", "myjob", 1)
	if _, _, err := client.Jobs().Register(job2, nil); err != nil {
		t.Fatalf("err: %s", err)
	}

	// Query again and check the result
	if code := cmd.Run([]string{"-http-addr=" + url}); code != 0 {
		t.Fatalf("expected exit 0, got: %d", code)
	}
	out := ui.OutputWriter.String()
	if !strings.Contains(out, "job1") || !strings.Contains(out, "job2") {
		t.Fatalf("expected job1 and job2, got: %s", out)
	}
	ui.OutputWriter.Reset()

	// Query a single job
	if code := cmd.Run([]string{"-http-addr=" + url, "job2"}); code != 0 {
		t.Fatalf("expected exit 0, got: %d", code)
	}
	out = ui.OutputWriter.String()
	if strings.Contains(out, "job1") || !strings.Contains(out, "job2") {
		t.Fatalf("expected only job2, got: %s", out)
	}
}

func TestStatusCommand_Fails(t *testing.T) {
	ui := new(cli.MockUi)
	cmd := &StatusCommand{Ui: ui}

	// Fails on misuse
	if code := cmd.Run([]string{"some", "bad", "args"}); code != 1 {
		t.Fatalf("expected exit code 1, got: %d", code)
	}
	if out := ui.ErrorWriter.String(); !strings.Contains(out, cmd.Help()) {
		t.Fatalf("expected help output, got: %s", out)
	}

	// Fails on connection failure
	if code := cmd.Run([]string{"-http-addr=nope"}); code != 1 {
		t.Fatalf("expected exit code 1, got: %d", code)
	}
	if out := ui.ErrorWriter.String(); !strings.Contains(out, "Failed querying jobs") {
		t.Fatalf("expected failed query error, got: %s", out)
	}
}
