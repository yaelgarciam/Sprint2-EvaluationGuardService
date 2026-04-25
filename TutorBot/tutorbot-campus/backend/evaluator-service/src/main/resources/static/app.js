const presets = {
    valid: {
        sessionId: "SESSION-WEB-201",
        studentId: "A00835001",
        topicId: 1,
        maxScore: 100,
        questionText: "¿Qué es HTML y para qué se utiliza?",
        studentAnswer: "Es un lenguaje de marcado que se utiliza para estructurar contenido web.",
        correctAnswer: "HTML es un lenguaje de marcado usado para estructurar el contenido de una página web."
    },
    topic404: {
        sessionId: "SESSION-WEB-404",
        studentId: "A00835001",
        topicId: 9999,
        maxScore: 100,
        questionText: "¿Qué es HTML?",
        studentAnswer: "Es un lenguaje de marcado.",
        correctAnswer: "Es un lenguaje de marcado."
    },
    topic422: {
        sessionId: "SESSION-WEB-TOPIC-422",
        studentId: "A00835001",
        topicId: 16,
        maxScore: 100,
        questionText: "¿Qué es seguridad en redes?",
        studentAnswer: "Protege la información en tránsito.",
        correctAnswer: "Seguridad en redes protege sistemas, datos y comunicaciones."
    },
    skill422: {
        sessionId: "SESSION-WEB-SKILL-422",
        studentId: "A00835005",
        topicId: 15,
        maxScore: 100,
        questionText: "¿Qué es TCP/IP?",
        studentAnswer: "Es una familia de protocolos de comunicación.",
        correctAnswer: "TCP/IP es la suite de protocolos que permite la comunicación en redes."
    },
    student422: {
        sessionId: "SESSION-WEB-STUDENT-422",
        studentId: "STU999",
        topicId: 1,
        maxScore: 100,
        questionText: "¿Qué es HTML?",
        studentAnswer: "Es un lenguaje de marcado.",
        correctAnswer: "Es un lenguaje de marcado."
    }
};

const form = document.getElementById("evaluationForm");
const responseMeta = document.getElementById("responseMeta");
const responseBody = document.getElementById("responseBody");
const evaluationsList = document.getElementById("evaluationsList");
const submitButton = document.getElementById("submitButton");
const submitHint = document.getElementById("submitHint");
const refreshButton = document.getElementById("refreshButton");
const resetFormButton = document.getElementById("resetFormButton");
const validAnswerButton = document.getElementById("validAnswerButton");
const healthStatus = document.getElementById("healthStatus");
const healthDetail = document.getElementById("healthDetail");

document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => fillForm(button.dataset.preset));
});

form.addEventListener("submit", submitEvaluation);
refreshButton.addEventListener("click", loadEvaluations);
resetFormButton.addEventListener("click", () => {
    form.reset();
    document.getElementById("maxScore").value = 100;
});
validAnswerButton.addEventListener("click", applyValidAnswer);

async function loadHealth() {
    try {
        const response = await fetch("/actuator/health");
        const body = await response.json();
        healthStatus.textContent = body.status === "UP" ? "Disponible" : body.status;
        healthDetail.textContent = body.status === "UP"
            ? "Disponible porque GET /actuator/health respondió status = UP."
            : `GET /actuator/health respondió status = ${body.status}.`;
    } catch (error) {
        healthStatus.textContent = "No disponible";
        healthDetail.textContent = "No se pudo consultar el estado del servicio.";
    }
}

async function loadEvaluations() {
    evaluationsList.textContent = "Actualizando evaluaciones...";

    try {
        const response = await fetch("/api/v1/evaluations");
        const body = await response.json();
        const evaluations = Array.isArray(body)
            ? [...body]
                .sort(compareEvaluationsDesc)
                .slice(0, 6)
            : [];

        if (evaluations.length === 0) {
            evaluationsList.className = "evaluations-list empty-state";
            evaluationsList.textContent = "Todavía no hay evaluaciones registradas.";
            return;
        }

        evaluationsList.className = "evaluations-list";
        evaluationsList.innerHTML = evaluations.map(renderEvaluationCard).join("");
    } catch (error) {
        evaluationsList.className = "evaluations-list empty-state";
        evaluationsList.textContent = "No se pudieron cargar las evaluaciones.";
    }
}

async function submitEvaluation(event) {
    event.preventDefault();

    const payload = {
        sessionId: form.sessionId.value.trim(),
        studentId: form.studentId.value.trim(),
        topicId: Number(form.topicId.value),
        maxScore: Number(form.maxScore.value),
        questionText: form.questionText.value.trim(),
        studentAnswer: form.studentAnswer.value.trim(),
        correctAnswer: form.correctAnswer.value.trim()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    submitHint.textContent = "Esperando respuesta del backend.";

    try {
        const response = await fetch("/api/v1/evaluations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const body = await response.json().catch(() => ({}));
        setResponseState(response.ok, response.status, body);

        if (response.ok) {
            submitHint.textContent = "Evaluación enviada correctamente.";
            await loadEvaluations();
        } else {
            submitHint.textContent = "El backend respondió con validación o error.";
        }
    } catch (error) {
        setResponseState(false, 0, { error: "No fue posible conectarse con el backend." });
        submitHint.textContent = "No se pudo enviar la solicitud.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Evaluar respuesta";
    }
}

function setResponseState(success, status, body) {
    const label = success ? "Solicitud completada" : "Solicitud rechazada";
    const code = status ? `HTTP ${status}` : "Sin respuesta HTTP";

    responseMeta.className = `response-meta ${success ? "success" : "error"}`;
    responseMeta.textContent = `${label} · ${code}`;
    responseBody.textContent = JSON.stringify(body, null, 2);
}

function fillForm(presetName) {
    const preset = presets[presetName];
    if (!preset) {
        return;
    }

    Object.entries(preset).forEach(([key, value]) => {
        form.elements[key].value = value;
    });
}

function applyValidAnswer() {
    const correctAnswer = form.correctAnswer.value.trim();
    if (!correctAnswer) {
        submitHint.textContent = "Primero escribe la respuesta correcta para poder copiar una respuesta válida.";
        return;
    }

    form.studentAnswer.value = correctAnswer;
    submitHint.textContent = "Se copió una respuesta válida en el campo del estudiante.";
}

function renderEvaluationCard(evaluation) {
    return `
        <article class="evaluation-card">
            <header>
                <strong>${escapeHtml(evaluation.studentId)} · Topic ${escapeHtml(String(evaluation.topicId))}</strong>
                <span class="score-chip">${escapeHtml(String(evaluation.score ?? 0))}/${escapeHtml(String(evaluation.maxScore ?? 100))}</span>
            </header>
            <div class="evaluation-meta">
                <span>Session: ${escapeHtml(evaluation.sessionId ?? "-")}</span>
                <span>ID: ${escapeHtml(String(evaluation.id ?? "-"))}</span>
            </div>
            <p class="evaluation-feedback">${escapeHtml(evaluation.feedbackSummary ?? "Sin retroalimentación disponible.")}</p>
        </article>
    `;
}

function compareEvaluationsDesc(left, right) {
    const leftTime = Date.parse(left.evaluatedAt ?? "");
    const rightTime = Date.parse(right.evaluatedAt ?? "");

    const normalizedLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
    const normalizedRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

    if (normalizedRightTime !== normalizedLeftTime) {
        return normalizedRightTime - normalizedLeftTime;
    }

    return Number(right.id ?? 0) - Number(left.id ?? 0);
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

fillForm("valid");
loadHealth();
loadEvaluations();
