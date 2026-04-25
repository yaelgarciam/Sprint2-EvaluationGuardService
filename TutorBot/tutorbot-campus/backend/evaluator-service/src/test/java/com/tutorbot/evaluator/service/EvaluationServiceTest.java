package com.tutorbot.evaluator.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;

import com.tutorbot.evaluator.dto.EvaluationRequest;
import com.tutorbot.evaluator.model.EvaluationResult;
import com.tutorbot.evaluator.ollama.OllamaService;
import com.tutorbot.evaluator.repository.EvaluationResultRepository;

class EvaluationServiceTest {

    @Test
    void shouldReturnPersistedEvaluations() {
        EvaluationResultRepository repository = Mockito.mock(EvaluationResultRepository.class);
        OllamaService ollamaService = Mockito.mock(OllamaService.class);
        EvaluationGuardService guard = Mockito.mock(EvaluationGuardService.class);
        EvaluationResult evaluationResult = new EvaluationResult();
        evaluationResult.setScore(92);
        when(repository.findAll()).thenReturn(List.of(evaluationResult));

        EvaluationService service = new EvaluationService(repository, ollamaService, guard);

        assertEquals(92, service.findAll().getFirst().score());
    }

    @Test
    void shouldAssignApprovedScoreWhenOllamaUnavailableAndAnswerIsValid() {
        EvaluationResultRepository repository = Mockito.mock(EvaluationResultRepository.class);
        OllamaService ollamaService = Mockito.mock(OllamaService.class);
        EvaluationGuardService guard = Mockito.mock(EvaluationGuardService.class);

        EvaluationRequest request = new EvaluationRequest(
                "SESSION-WEB-201",
                "A00835001",
                "¿Que es HTML y para que se utiliza?",
                "HTML es un lenguaje de marcado usado para estructurar el contenido de una pagina web.",
                "HTML es un lenguaje de marcado usado para estructurar el contenido de una pagina web.",
                100,
                1L);

        when(ollamaService.evaluate(request.questionText(), request.studentAnswer(), request.correctAnswer()))
                .thenReturn("Evaluation service temporarily unavailable.");
        when(repository.save(Mockito.any(EvaluationResult.class))).thenAnswer(invocation -> {
            EvaluationResult entity = invocation.getArgument(0);
            entity.setId(999L);
            return entity;
        });

        EvaluationService service = new EvaluationService(repository, ollamaService, guard);

        var response = service.evaluate(request);

        assertEquals(100, response.score());
        assertTrue(response.feedbackSummary().contains("evaluacion local"));
    }

    @Test
    void shouldKeepFailureMessageWhenOllamaUnavailableAndAnswerIsInvalid() {
        EvaluationResultRepository repository = Mockito.mock(EvaluationResultRepository.class);
        OllamaService ollamaService = Mockito.mock(OllamaService.class);
        EvaluationGuardService guard = Mockito.mock(EvaluationGuardService.class);

        EvaluationRequest request = new EvaluationRequest(
                "SESSION-WEB-422",
                "A00835001",
                "¿Que es HTML y para que se utiliza?",
                "No lo se.",
                "HTML es un lenguaje de marcado usado para estructurar el contenido de una pagina web.",
                100,
                1L);

        when(ollamaService.evaluate(request.questionText(), request.studentAnswer(), request.correctAnswer()))
                .thenReturn("Evaluation service temporarily unavailable.");
        when(repository.save(Mockito.any(EvaluationResult.class))).thenAnswer(invocation -> {
            EvaluationResult entity = invocation.getArgument(0);
            entity.setId(1000L);
            return entity;
        });

        EvaluationService service = new EvaluationService(repository, ollamaService, guard);

        var response = service.evaluate(request);

        assertEquals(0, response.score());
        assertEquals("Evaluation service temporarily unavailable.", response.feedbackSummary());
    }
}
